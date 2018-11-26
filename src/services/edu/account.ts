import Taro from '@tarojs/taro'

import utils from "../../utils/utils";
import global from "../../utils/global"

class Account {
  static get ():any {
    let account
    account = global.cache.get('account')

    if (utils.isObj(account)) {
      return account
    }

    account = Taro.getStorageSync('account')

    if (account === "") {
      return false
    }

    global.cache.set('account', account)

    return account
  }

  static reCache (account: any = false) {
    account = account ? account : Taro.getStorageSync('account')
    global.cache.set('account', account)
  }

  static calFourYears (): Array<number> {
    const account = this.get()
    if (!account.studentID) {
      return []
    }
    const startYear = parseInt(account.studentID.slice(2, 4))
    const fourYears = [
      startYear+0,
      startYear+1,
      startYear+2,
      startYear+3,
    ]
    return fourYears.map((item) => {return 2000+item})
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
    const account = this.get()

    if (!account || !utils.isObj(account)) {
      return false
    }
    
    const state = account[`${type}Password`]
    return utils.isObj(state) && state !== ""
  }
}

export default Account