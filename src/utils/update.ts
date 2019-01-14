import Taro from '@tarojs/taro'
import data from './data'

class Update {
  static getVersion () {
    const v = Taro.getStorageSync('version')
    if (!v) {
      Taro.setStorageSync('version', data.version)
    }
    return v || data.version
  }

  static Check () {
    let update = true

    switch(this.getVersion()) {
      case '0.3.4':
      this.updateCustomField()
      break
      case '0.3.5':
      this.updateDefaultValue()
      this.updateRecommendStruct()
      break
      default:
      update = false
    }

    // 升级后更新本地储存的版本号
    if (update) {
      console.log('Detect update')
      Taro.setStorageSync('version', data.version)
    }
  }

  // 0.3.4 -> 0.3.5
  static updateCustomField () {
    const before = Taro.getStorageSync('mySchedule')
    if (!before) { return }
    Taro.setStorageSync('customSchedule', before)
    Taro.setStorageSync('mySchedule', '')
  }

  // 0.3.5 -> 0.3.6
  static updateDefaultValue () {
    const before = Taro.getStorageSync('customSchedule')
    if (before !== '') { return }
    Taro.setStorageSync('customSchedule', [])
  }

  // 0.3.5 -> 0.3.6
  static updateRecommendStruct () {
    const before = Taro.getStorageSync('recommendSchedules')

    if (before === '') {
      return
    }
    
    const recommendSchedules: Array<any> = []

    for (let item of before) {
      item.schedules.forEach(s => {
        s.yearSemester = item.key
        recommendSchedules.push(s)
      })
    }

    Taro.setStorageSync('recommendSchedules', recommendSchedules)
  }
}

export default Update