import Taro from '@tarojs/taro'
import utils from './utils'

export default function init () {
  const firstUse = Taro.getStorageSync('firstUse')
  console.log("Frist use judge: ", firstUse === "")

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

    console.log('Init app')
    utils.setStorage({
      'firstUse': false,
      'schedule': [],
      'mySchedule': [],
      'cardSetting': cardSetting,
      'schoolOpenDate': '2018-09-10',
    })
  }
}