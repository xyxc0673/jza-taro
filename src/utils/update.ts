import Taro from '@tarojs/taro'

class Update {
  // 0.3.4 -> 0.3.5
  static updateCustomField () {
    const before = Taro.getStorageSync('mySchedule')
    if (!before) { return }
    Taro.setStorageSync('customSchedule', before)
    Taro.setStorageSync('mySchedule', '')
  }
}

export default Update