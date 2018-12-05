import Taro from '@tarojs/taro'

import utils from "../../utils/utils";
import global from "../../utils/global"

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

  static Get ():any {
    return this.get('account')
  }

  static GetLib ():any {
    return this.get('libAccount')
  }

  static save (key, value) {
    Taro.setStorageSync(key, value)
    global.cache.Set(key, value)
  }

  static Save (account) {
    this.save('account', account)
  }

  static SaveLib (account) {
    this.save('libAccount', account)
  }

  static calSchoolYears (): Array<number> {
    const account = this.Get()
    if (!account.studentID) {
      return []
    }

    const major = parseInt(account.studentID.slice(0, 2))
    const startYear = parseInt(account.studentID.slice(2, 4))

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

    // 继续教育学院
    if (major === 21) {
      schoolYears.splice(3, 1)
    }

    return schoolYears.map((item) => {return 2000+item})
  }

  static calYearTerm () {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const term = (month <= 2 || month >= 8) ? 1 : 2
    const schoolYear = month < 8 ? year - 1 : year
    return {year: schoolYear, term: term}
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