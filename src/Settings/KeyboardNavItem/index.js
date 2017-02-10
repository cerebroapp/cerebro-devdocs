const React = require('react')
const styles = require('./styles.css')

const KeyboardNavItem = (props) => {
  let className = styles.item
  className += props.className ? ` ${props.className}` : ''
  const onSelect = props.onSelect || (() => {})
  const onClick = onSelect
  const onKeyDown = (event) => {
    if (props.onKeyDown) {
      props.onKeyDown(event)
    }
    if (!event.defaultPrevented && event.keyCode === 13) {
      onSelect()
    }
  }
  const itemProps = {
    className,
    onClick,
    onKeyDown,
    tabIndex: 0,
  }
  const TagName = props.tagName ? props.tagName : 'div'
  return (
    <TagName {...props} {...itemProps} />
  )
}

KeyboardNavItem.propTypes = {
  className: React.PropTypes.string,
  tagName: React.PropTypes.string,
  onSelect: React.PropTypes.func,
  onKeyDown: React.PropTypes.func,
}

module.exports = KeyboardNavItem
