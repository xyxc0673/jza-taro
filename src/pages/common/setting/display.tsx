import Taro, {Component, Config} from '@tarojs/taro'
import {View, Switch, Image} from '@tarojs/components'

import './display.scss'

import { ISetting, ICardSetting } from '../../../interfaces/setting'

export default class Card extends Component {
  config: Config = {
    navigationBarTitleText: '显示'
  }
  
  state = {
    cardSetting: [] as Array<ICardSetting>,
    setting: {} as ISetting,
    scheduleBgStyle: ['原始图片', '高斯模糊'],
  }

  componentWillMount () {
    const state = this.state

    const allStorageKeys = [
      'cardSetting',
      'setting',
    ]

    const newState = {}

    for(let key of allStorageKeys) {
      newState[key] = Taro.getStorageSync(key)
    }

    this.setState(Object.assign({}, state, newState))
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

    if (key === 'displayScheduleBg' && e.detail.value === false) {
      setting = Object.assign({}, setting, { displayScheduleBgSource: '' })
    }

    Taro.setStorageSync('setting', setting)

    this.setState({ setting })

    Taro.eventCenter.trigger('indexRemount')
    Taro.showToast({title: `${e.detail.value ? '开启': '关闭'} ${name}`, icon: 'none'})
  }

  async handleChooseBg () {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    })

    if (res.tempFiles.length === 0) {
      return
    }

    let { setting } = this.state

    console.log(res.tempFilePaths[0])

    setting.displayScheduleBgSource = res.tempFilePaths[0]

    this.setState({ setting })
    Taro.setStorageSync('setting', setting)
  }

  async handleSwitchBgStyle () {
    const { scheduleBgStyle } = this.state
    const res = await Taro.showActionSheet({
      itemList: scheduleBgStyle
    })
    
    if (res.tapIndex < 0) {
      return
    }

    let { setting } = this.state

    setting.displayScheduleBgStyle = res.tapIndex

    this.setState({ setting })
    Taro.setStorageSync('setting', setting)
  }

  render () {
    const { cardSetting, setting, scheduleBgStyle } = this.state
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
          <View className='list-title'>今日课表</View>
          <View className='list-container'>
            <View className='list-item'>
              <View className='list-item__title'>显示上课时间</View>
              <Switch checked={setting.todayScheduleDisplayTimeTable || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'todayScheduleDisplayTimeTable', '显示上课时间')} />
            </View>
            <View className='list-item'>
              <View className='list-item__title'>显示上课教师</View>
              <Switch checked={setting.todayScheduleDisplayTeacher || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'todayScheduleDisplayTeacher', '今日课表显示上课教师')} />
            </View>
          </View>
        </View>
        <View className='list'>
          <View className='list-title'>我的课表</View>
          <View className='list-container'>
            <View className='list-item'>
              <View className='list-item__title'>显示非本周课程</View>
              <Switch checked={setting.displaNotCurrentWeekCourse || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'displaNotCurrentWeekCourse', '显示非本周课程')} />
            </View>
          </View>
        </View>
        <View className='list'>
          <View className='list-title'>课表背景</View>
          <View className='list-container'>
          <View className='list-item'>
            <View className='list-item__title'>自定义课表背景</View>
            <Switch checked={setting.displayScheduleBg || false} color='rgba(52, 142, 141, 0.7)' onChange={this.handleNormalChange.bind(this, 'displayScheduleBg', '自定义课表背景')} />
          </View>
          {setting.displayScheduleBg
          ?(
            <View>
              <View className='list-item' onClick={this.handleChooseBg}>
                <View className='list-item__title'>选择背景图片</View>
                <Image className='bg-image' src={setting.displayScheduleBgSource} />
              </View>
              <View className='list-item' onClick={this.handleSwitchBgStyle}>
                <View className='list-item__title'>背景图片样式</View>
                <View className='bg-style-text'>{scheduleBgStyle[setting.displayScheduleBgStyle || 0]}</View>
              </View>
            </View>
          )
          : null}
          </View>
        </View>
      </View>
    )
  }
}