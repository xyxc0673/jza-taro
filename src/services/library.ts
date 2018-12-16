import Taro from '@tarojs/taro'
import request from '../utils/request'

class Library {
  static _isValid (response) {
    if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
      return false
    }
    return true
  }

  static async getCaptchaResponse (withToken) {
    const opacToken = withToken ? Taro.getStorageSync('opacToken') : ''

    const response = await request.libReaderCaptcha({opacToken: opacToken})

    if (!response) {
      return
    }

    return response
  }

  static async getInfo () {
    const response = await request.libReaderInfo({quiet_mode: true})

    if (!response) {
      return
    }

    if (!this._isValid(response)) {
      return { isLogin: false }
    }

    const { nearExpire, expired, order } = response.data.data

    return { isLogin: true, nearExpire: nearExpire, expired: expired, order: order }
  }

  static async getCurrentCheckout() {
    const response = await request.libReaderCurrentCheckout({quiet_mode: false})

    if (!response || !this._isValid(response)) {
      return
    }

    return response.data.data.record
  }

  static async getCheckoutRecord (page: number) {
    const response = await request.libReaderCheckoutRecord({page: page, quiet_mode: false})

    if (!response || !this._isValid(response)) {
      return
    }

    return response.data.data
  }

  static async getRenewCheck (barcode) {
    const response = await request.libReaderRenewCheck({barcode: barcode, quiet_mode: false})

    if (!response) {
      return
    }

    if (!this._isValid(response)) {
      Taro.showModal({title: '提示', content: '登录已过期，请重新登录', showCancel: false})
      return
    }
    
    return response.data.data.check
  }

  static async renewBook (captcha, barcode, check) {
    const response = await request.libReaderRenew({captcha: captcha, barcode: barcode, check: check})

    if (!response || response.data.code == -1) {
      return
    }

    if (!this._isValid(response)) {
      Taro.showModal({title: '提示', content: '登录已过期，请重新登录', showCancel: false})
      return
    }

    return response
  }
}

export default Library