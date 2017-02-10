const React = require('react')
const Doc = require('./Doc')
const db = require('../db')
const url = require('url')
const { shell } = require('electron')

class Preview extends React.Component {
  constructor(props) {
    super(props)
    this.onNavigate = this.onNavigate.bind(this)
    this.state = {
      path: props.path
    }
  }
  onNavigate(newPath) {
    if (url.parse(newPath).host) {
      // Open external url in default browser
      return shell.openExternal(newPath)
    }
    this.setState(state => ({
      path: url.resolve(state.path, newPath)
    }))
  }
  render() {
    const path = this.state.path
    const anchor = url.parse(path).hash
    const content = db.getContent(path)
    return (
      <Doc
        key={content}
        anchor={anchor}
        content={content}
        onNavigate={this.onNavigate}
      />
    )
  }
}

module.exports = Preview
