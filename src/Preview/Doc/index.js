const React = require('react')
const styles = require('./styles.css')
const format = require('./formatContent')
const each = require('lodash/each')

class Doc extends React.Component {
  componentDidMount() {
    if (!this._iframe) return
    const { anchor, onNavigate } = this.props
    const { contentWindow } = this._iframe
    contentWindow.addEventListener('load', () => {
      if (anchor) {
        contentWindow.location.hash = anchor
      }

      each(this._iframe.contentDocument.links, (link) => {
        link.addEventListener('click', (e) => {
          const href = e.currentTarget.getAttribute('href')
          if (href) {
            onNavigate(href)
            e.preventDefault()
          }
        })
      })
    })
  }
  render() {
    const { content, anchor } = this.props
    return <iframe ref={(el) => this._iframe = el } srcDoc={format(content)} className={styles.preview} />
  }
}

module.exports = Doc
