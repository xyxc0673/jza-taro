import Taro from '@tarojs/taro'
import data from './data'

class Update {
  static async checkUpdateOnline () {
    const updateManager = Taro.getUpdateManager()
  
    updateManager.onUpdateReady(async () => {
      console.log('检测到新版本')
      const resp = await Taro.showModal({title: '提示', content: '新版本已经准备好，是否重启应用？'})
      if (resp.confirm) {
        updateManager.applyUpdate()
      }
    })
  }

  static Check () {
    console.log("版本更新检测")

    let update = true

    const storageVersion = Taro.getStorageSync('version')
    const dataVersion = data.version

    switch(storageVersion || dataVersion) {
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
    if (update || !storageVersion) {
      console.log('检测到更新或者本地无版本号')
      Taro.setStorageSync('version', data.version)
      Taro.showModal({title: '提示', content: data.newFuture, showCancel: false})
    }

    this.checkUpdateOnline()
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