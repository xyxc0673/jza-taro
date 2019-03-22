import Taro from '@tarojs/taro'

import utils from "../utils/utils";
import global from "../utils/global"

class Account {
  static get (key) {
    let account
    account = global.cache.Get(key)

    if (utils.isObj(account)) {
      return account
    }

    account = Taro.getStorageSync(key)

    if (account === "") {
      return false
    }

    global.cache.Set(key, account)

    return account
  }

  static save (key, value) {
    Taro.setStorageSync(key, value)
    global.cache.Set(key, value)
  }

  static Get ():any {
    return this.get('account')
  }

  static GetLib ():any {
    return this.get('libAccount')
  }

  static Save (account) {
    this.save('account', account)
  }

  static SaveLib (account) {
    this.save('libAccount', account)
  }

  static calSchoolYears (id?: string): Array<number> {
    const account = this.Get()

    const _id = id || account.studentID

    if (!_id) {
      return []
    }

    const final_id = _id.substr(0, 1).toUpperCase() !== 'Z' ? _id : `_${_id}`
    
    const major = parseInt(final_id.slice(0, 2))
    const startYear = parseInt(final_id.slice(2, 4))

    const schoolYears = [
      startYear+0,
      startYear+1,
      startYear+2,
      startYear+3,
    ]

    // 建筑学院
    if (major === 11) {
      schoolYears.push(startYear+4)
    }

    return schoolYears.map((item) => {return 2000+item})
  }

  static getYearSemester () {

  }

  static calYearSemester () {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const Semester = (month <= 1 || month >= 8) ? 1 : 2
    const schoolYear = month < 7 ? year - 1 : year
    return {year: schoolYear, semester: Semester}
  }

  static checkBindState(type: string): boolean {
    let account

    if (type === "lib") {
      account = this.GetLib()
    } else {
      account = this.Get()
    }

    if (!account || !utils.isObj(account)) {
      return false
    }
    
    let state

    if (type === "lib") {
      state = account['password']
    } else {
      state = account[`${type}Password`]
    }

    return utils.isObj(state) && state !== ""
  }
}

export default Account