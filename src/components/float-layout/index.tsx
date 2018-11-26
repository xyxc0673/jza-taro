import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'

import './index.scss'

interface IProps {
  title?: string,
  isOpened: boolean,
  onClose: Function,
}

interface IState {
  _isOpened: boolean,
  title: string,
}

export default class FloatLayout extends Component<IProps, IState> {
  static defaultProps = {
    title: ''
  }

  constructor (props) {
    super(...arguments)
    const { title, isOpened } = props
    this.state = {
      title: title,
      _isOpened: isOpened
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isOpened, title } = nextProps
    if (isOpened != this.state._isOpened) {
      this.setState({_isOpened: isOpened})
      !isOpened && this.close()
    }
    if (title != this.state.title) {
      this.setState({title: title})
    }
  }

  handleClose () {
    this.props.onClose()
  }

  close () {
    this.setState({_isOpened: false}, this.handleClose)
  }

  preventClose (e) {
    e.stopPropagation()
  }

  render () {
    const { title } = this.state

    return (
      <View className={`float-layout ${this.state._isOpened ? 'active' : ''}`} onClick={this.close}>
        <View className="container" onClick={this.preventClose}>
          {title ? <View className="title">{title}</View> : null}
          {this.props.children}
        </View>
      </View>
    )
  }
}