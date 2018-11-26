import Taro, {Component, Config} from '@tarojs/taro'
import {View, Switch} from '@tarojs/components'

import './display.scss'

export default class Card extends Component {
  config: Config = {
    navigationBarTitleText: '显示'
  }
  
  state = {
    cardSetting: Taro.getStorageSync('cardSetting'),
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleChange (key, e) {
    const changeHuman = e.detail.value ? '开启': '关闭'
    const { cardSetting } = this.state

    cardSetting[key].show = e.detail.value

    Taro.setStorageSync('cardSetting', cardSetting)
    this.setState({cardSetting: cardSetting})
    Taro.eventCenter.trigger('indexRemount')
    Taro.showToast({title: `${cardSetting[key].title}${changeHuman}显示`, icon: 'none'})
  }

  render () {
    const { cardSetting } = this.state
    return (
      <View className='page'>
        <View className='list'>
          <View className='list-tip'>选择主页上的卡片是否显示</View>
          {cardSetting.map((item, index) => {
            return (
              <View className='list-item' key={index}>
                <View className='list-item__title'>{item.title}</View>
                <Switch checked={item.show} onChange={this.handleChange.bind(this, index)}></Switch>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}