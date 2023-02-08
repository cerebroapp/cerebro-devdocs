const remote = require("@electron/remote")
const fs = require('fs')
const path = require('path')

const CACHE_FILE = path.join(remote.app.getPath('userData'), 'devdocs.json')
const cacheOptions = {
  encoding: 'utf-8'
}

const load = () => (
  new Promise(resolve => {
    fs.exists(CACHE_FILE, exists => {
      if (!exists) return
      fs.readFile(CACHE_FILE, cacheOptions, (err, content) => {
        try {
          const cache = JSON.parse(content)
          resolve(cache)
        } catch (e) {
          // Do not raise error when cache can't be loaded
        }
      })
    })
  })
)

const save = data => (
  new Promise(resolve => {
    fs.writeFile(CACHE_FILE, JSON.stringify(data), cacheOptions, resolve)
  })
)

module.exports = {
  save,
  load
}
