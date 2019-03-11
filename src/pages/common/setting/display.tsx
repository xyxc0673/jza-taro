import Taro, {Component, Config} from '@tarojs/taro'
import {View, Switch} from '@tarojs/components'

import './display.scss'

import ISetting from '../../../interfaces/setting'

export default class Card extends Component {
  config: Config = {
    navigationBarTitleText: '显示'
  }
  
  state = {
    cardSetting: Taro.getStorageSync('cardSetting'),
    setting: {} as ISetting,
  }

  componentWillMount () {
    const allStorageKeys = [
      'cardSetting',
      'setting',
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
    let { setting } = this.state

    setting = Object.assign({}, setting, { [key]: e.detail.value })

    Taro.setStorageSync('setting', setting)

    this.setState({ setting })

    Taro.eventCenter.trigger('indexRemount')
    Taro.showToast({title: `${e.detail.value ? '开启': '关闭'} ${name}`, icon: 'none'})
  }

  render () {
    const { cardSetting, setting } = this.state
    return (
      <View className='page'>
        <View className='list'>
          <View className='list-title'>卡片开关</View>
          <View className='list-container'>
            {cardSetting.map((item, index) => {
              return (
                <View className='list-item' key={index}>
                  <View className='list-item__title'>{item.title}</View>
                  <Switch checked={item.show} color='rgba(52, 142, 141, 0.7)' onChange={this.handleCardChange.bind(this, index)} />
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
              <Switch checked={setting.displaNotCurrentWeekCourse || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'displaNotCurrentWeekCourse', '显示非本周课程')} />
            </View>
            <View className='list-item'>
              <View className='list-item__title'>今日课表显示上课时间</View>
              <Switch checked={setting.todayScheduleDisplayTimeTable || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'todayScheduleDisplayTimeTable', '今日课表显示上课时间')} />
            </View>
          </View>
        </View>
      </View>
    )
  }
}