import Taro, {Component, Config} from '@tarojs/taro'
import {View, Switch} from '@tarojs/components'

import './display.scss'

export default class Card extends Component {
  config: Config = {
    navigationBarTitleText: '显示'
  }
  
  state = {
    cardSetting: Taro.getStorageSync('cardSetting'),
    displaNotCurrentWeekCourse: false,
  }

  componentWillMount () {
    const allStorageKeys = [
      'cardSetting',
      'displaNotCurrentWeekCourse',
    ]

    const newState = {}

    for(let key of allStorageKeys) {
      newState[key] = Taro.getStorageSync(key)
    }

    this.setState(newState)
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCardChange (key, e) {
    const changeHuman = e.detail.value ? '开启': '关闭'
    const { cardSetting } = this.state

    cardSetting[key].show = e.detail.value

    Taro.setStorageSync('cardSetting', cardSetting)
    this.setState({cardSetting: cardSetting})
    Taro.eventCenter.trigger('indexRemount')
    Taro.showToast({title: `${cardSetting[key].title}${changeHuman}显示`, icon: 'none'})
  }

  handleNormalChange (key, name, e) {
    const changeHuman = e.detail.value ? '开启': '关闭'
    Taro.setStorageSync(key, e.detail.value)
    Taro.showToast({title: `${changeHuman} ${name}`, icon: 'none'})
  }

  render () {
    const { cardSetting, displaNotCurrentWeekCourse } = this.state
    return (
      <View className='page'>
        <View className='list'>
          <View className='list-title'>卡片开关</View>
          <View className='list-container'>
            {cardSetting.map((item, index) => {
              return (
                <View className='list-item' key={index}>
                  <View className='list-item__title'>{item.title}</View>
                  <Switch checked={item.show} onChange={this.handleCardChange.bind(this, index)} />
                </View>
              )
            })}
          </View>
        </View>
        <View className='list'>
          <View className='list-title'>我的课表</View>
          <View className='list-container'>
            <View className='list-item'>
              <View className='list-item__title'>显示非本周课程</View>
              <Switch checked={displaNotCurrentWeekCourse || false} onChange={this.handleNormalChange.bind(this, 'displaNotCurrentWeekCourse', '显示非本周课程')} />
            </View>
          </View>
        </View>
      </View>
    )
  }
}