const React = require('react')
const { memoize, search } = require('cerebro-tools')
const KeyboardNav = require('./KeyboardNav')
const KeyboardNavItem = require('./KeyboardNavItem')
const styles = require('./styles.css')
const groupBy = require('lodash/groupBy')
const map = require('lodash/map')
const property = require('lodash/property')
const icons = require('../icons')
const { getAvailableDocs, isInstalled } = require('../db')

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      disabled: [],
      enabled: []
    }
    this.renderDoc = this.renderDoc.bind(this)
    this.updateDb = this.updateDb.bind(this)
  }
  updateDb() {
    getAvailableDocs().then(docs => this.setState({
      ...groupBy(docs, doc => isInstalled(doc) ? 'enabled' : 'disabled'),
      rerender: new Date().getTime()
    }))
  }
  componentDidMount() {
    this.updateDb()
  }
  filterDocs(docs) {
    return this.props.term
      ? search(docs, this.props.term, property('name'))
      : docs
  }
  renderDoc(doc, action) {
    const onSelect = () => action(doc).then(this.updateDb)
    return (
      <KeyboardNavItem
        className={styles.doc}
        onSelect={onSelect}
      >
        {icons[doc.group] && <img src={icons[doc.group]} className={styles.docIcon} />}
        {!icons[doc.group] && <span className={styles.iconPlaceholder} />}
        {`${doc.name} ${doc.version ? doc.version : ''}`}
      </KeyboardNavItem>
    )
  }
  render() {
    const enabledDocs = this.filterDocs(this.state.enabled)
    const disabledDocs = this.filterDocs(this.state.disabled)
    return (
      <div className={styles.settings} key={this.state.rerender}>
        <KeyboardNav>
          { enabledDocs.length > 0 && <h3>Enabled ({enabledDocs.length})</h3> }
          { enabledDocs.map(doc => this.renderDoc(doc, this.props.onUninstall)) }
          { disabledDocs.length > 0 && <h3>Disabled ({disabledDocs.length})</h3> }
          { disabledDocs.map(doc => this.renderDoc(doc, this.props.onInstall)) }
        </KeyboardNav>
      </div>
    )
  }
}

module.exports = Settings
