import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

import './index.scss'

interface IProps {
  title: string,
  rightTip?: string,
  nonText?: string,
  none?: boolean
  marginBottom?: number,
  padding?: string,
  onClick?: Function,
  onRightTipClick?: Function,
}

interface IState {
  none: boolean
}

export default class Panel extends Component<IProps, IState> {
  static defaultProps = {
    title: '',
    none: false,
    marginBottom: -1,
  } as IProps

  constructor (props) {
    super(...arguments)

    const {none} = props
    this.setState({none: none})
  }

  componentWillReceiveProps(nextProps) {
    const {none} = nextProps
    if (none != this.state.none) {
      this.setState({none: none})
    }
  }

  handleClick () {
    if (!this.props.onClick) {
      return
    }
    this.props.onClick()
  }

  handleRightTipClick (e) {
    e.stopPropagation()

    this.props.onRightTipClick && this.props.onRightTipClick()
  }

  render () {
    const {title, none, rightTip, nonText, marginBottom, padding} = this.props
    return (
      <View className={`panel} ${!padding ? 'padding': ''}`} style={`padding:${padding || ''}; margin-bottom: ${marginBottom !== -1 ? marginBottom: 20}rpx`} onClick={this.handleClick}>
        {title !== ''
          ? (
            <View className="panel-header">
              <Text className="panel-header__title">{title}</Text>
              {rightTip ? <View className="panel-header__right-tip" onClick={this.handleRightTipClick}>{rightTip}</View>: null}
            </View>
          )
          :null
        }
        <View className="panel-body">
          {!this.state.none ? this.props.children : <Text className={`${none ? 'none-text': ''}`}>{nonText}</Text>}
        </View>
      </View>
    )
  }
}