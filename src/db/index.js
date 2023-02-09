const mapKeys = require('lodash/mapKeys')
const pickBy = require('lodash/pickBy')
const find = require('lodash/find')
const url = require('url')
const Fuse = require('fuse.js')
const tools = require('cerebro-tools')

const cache = require('./cache')

let indexes = {}
let docs = {}
let db = {}

const reindex = () => {
  Object.keys(db).forEach(key => {
    if (!indexes[key]) {
      indexes[key] = new Fuse(db[key].entries, {
        keys: ['name']
      })
    }
  })
}

cache.load().then(json => {
  db = { ...json.db, ...db }
  docs = { ...json.docs, ...docs }
  reindex()
})

const slugToGroup = slug => slug.split('~')[0]

const fetchDb = doc => (
  fetch(`https://documents.devdocs.io/${doc.slug}/db.json`)
    .then(response => response.json())
)

const fetchEntries = doc => (
  fetch(`https://documents.devdocs.io/${doc.slug}/index.json`)
    .then(response => response.json())
    .then(json => json.entries)
)

const getAvailableDocs = tools.memoize(() => (
  fetch('https://devdocs.io/docs/docs.json')
    .then(response => response.json())
    .then(docs => docs.map(doc => ({
      ...doc,
      group: slugToGroup(doc.slug)
    })))
))

const formatEntry = ({ slug, group }) => (entry) => {
  return {
    ...entry,
    path: `${slug}/${entry.path}`
  }
}

const install = (doc) => {
  return Promise.all([
    fetchDb(doc),
    fetchEntries(doc)
  ]).then(([newDocs, newEntries]) => {
    docs = {
      ...docs,
      ...mapKeys(newDocs, (_, key) => `${doc.slug}/${key}`)
    }
    db[doc.slug] = {
      ...doc,
      entries: newEntries.map(formatEntry(doc)),
    }
    reindex()
    cache.save({ db, docs })
  })
}

const uninstall = (doc) => {
  db = pickBy(db, (dbDoc) => dbDoc.slug !== doc.slug)
  docs = pickBy(docs, (dbDoc, key) => !key.startsWith(doc.slug))
  indexes = pickBy(indexes, (index, key) => !key.startsWith(doc.slug))
  return cache.save({ db, docs })
}

const search = ({ group, term }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchIndexes = Object
        .keys(indexes)
        .filter(slug => slugToGroup(slug) === group)
        .map(slug => indexes[slug])
      if (searchIndexes.length === 0) return resolve([])
      const results = !!term
        ? searchIndexes.reduce((acc, index) => [
            ...acc,
            ...index.search(term)
          ], [])
        : find(db, (value, key) => key.startsWith(group)).entries || []
      resolve(results.slice(0, 100))
    }, 0)
  })
}

const searchDocumentation = (term) => (
  tools.search(Object.keys(db), term).map(key => db[key])
)

const getContent = (path) => docs[url.parse(path).path]

const isInstalled = ({ slug }) => !!db[slug]

module.exports = {
  getAvailableDocs,
  getContent,
  install,
  uninstall,
  search,
  searchDocumentation,
  isInstalled
}
