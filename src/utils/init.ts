import Taro from '@tarojs/taro'
import utils from './utils'
import Update from './update'

export default function init () {
  const firstUse = Taro.getStorageSync('firstUse')
  console.log("第一次使用：", firstUse === "" ? "是" : "否")

  if (firstUse === "") {
    const cardSetting = [
      {
        key: 'notice',
        showKey: 'showNotice',
        title: '通知',
        show: true,
      },
      {
        key: 'jw',
        verifiedKey: 'jwVerified',
        showKey: 'showSchedule',
        title: '今日课表',
        show: true,
      },
      {
        key: 'card',
        verifiedKey: 'cardVerified',
        showKey: 'showBalance',
        title: '校园卡余额',
        show: true,
      }
    ]

    console.log('初始化小程序')
    utils.setStorage({
      'firstUse': false,
      'schedule': [],
      'customSchedule': [],
      'cardSetting': cardSetting,
    })
  }

  Update.Check()
}