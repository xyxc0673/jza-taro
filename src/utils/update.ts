import Taro from '@tarojs/taro'
import data from './data'
import { ISetting } from '../interfaces/setting'
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

    const storageVersion = Taro.getStorageSync('version')
    const dataVersion = data.version

    if (storageVersion === dataVersion) {
      console.log('已是最新版本，无需进行更新操作')
      return
    }

    switch(storageVersion || dataVersion) {
      case '0.3.9(190301)':
        this.updateSettingStruct()
        break
      case '0.4.1(190316)':
        this.updateDefaultSetting()
        break
    }

  // 升级后更新本地储存的版本号
    console.log('检测到更新或者本地无版本号')
    Taro.setStorageSync('version', data.version)
    Taro.showModal({title: '新特性', content: data.newFuture, showCancel: false})

    this.checkUpdateOnline()
  }

  static updateSettingStruct () {
    const setting: ISetting = Taro.getStorageSync('setting')
    const displaNotCurrentWeekCourse = Taro.getStorageSync('displaNotCurrentWeekCourse')

    setting.todayScheduleDisplayTeacher = true
    setting.displaNotCurrentWeekCourse =  displaNotCurrentWeekCourse || false
    console.log(setting)
    Taro.setStorageSync('setting', setting)
  }

  static updateDefaultSetting () {
    const setting: ISetting = Taro.getStorageSync('setting')

    Object.assign(setting, { displaSaturdayCourse: true, displaSundayCourse: true })

    Taro.setStorageSync('setting', setting)
  }
}

export default Update