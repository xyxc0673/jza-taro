import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'

import './index.scss'

interface IProps {
  title: string,
}

export default class LineText extends Component<IProps, {}> {
  static defaultProps = {
    title: '',
  } as IProps

  constructor (props) {
    super(...arguments)
    this.props = props
  }

  render () {
    return (
      <View className="line-text">
        {this.props.title}
      </View>
    )
  }
}