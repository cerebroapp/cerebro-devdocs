'use strict'

const React = require('react')
const Settings = require('./Settings')
const Preview = require('./Preview')
const db = require('./db')
const { search } = require('cerebro-tools')
const icon = require('./icons/plugin.png')
const icons = require('./icons')

const keyword = 'devdocs'

const getIcon = (group) => (
  icons[group] ? icons[group] : icon
)

const notMatch = term => item => (
  item.group !== term && `${item.group} ` !== term
)

const autocomplete = ({term, display, actions}) => {
  const autocompleteResults = db.searchDocumentation(term)
    .filter(notMatch(term))
    .map(item => ({
      icon: getIcon(item.group),
      title: `Search ${item.name} docs`,
      term: `${item.group} `,
      onSelect: (event) => {
        event.preventDefault()
        actions.replaceTerm(`${item.group} `)
      }
    }))
  display(autocompleteResults)
}

const searchDoc = ({term, display, actions}) => {
  const match = term.match(/(\w+)\s*(.*)$/)
  if (match) {
    const [_, group, term] = match
    db.search({ group, term })
      .then(results => results.map(x => (
        {
          title: x.name,
          subtitle: x.type,
          icon: getIcon(group),
          onSelect: () => actions.open(`http://devdocs.io/${x.path}`),
          getPreview: () => <Preview key={x.path} path={x.path} />
        }
      )))
      .then(display)
  }
}

const settings = ({ term, display, update }) => {
  const match = term.match(/^devdocs\s*(.+)?$/)
  if (match) {
    display({
      icon,
      title: 'DevDocs Settings',
      subtitle: 'Select docs that you want to use',
      getPreview: () => (
        <Settings
          term={match[1]}
          onInstall={db.install}
          onUninstall={db.uninstall}
        />
      )
    })
  }
}

const fn = (props) => {
  autocomplete(props)
  searchDoc(props)
  settings(props)
}

module.exports = {
  fn, icon, keyword,
  name: 'DevDocs Settings',
}
