import Taro from '@tarojs/taro'
import api from './api'
import utils from './utils'
import global from './global'
import Account from '../services/edu/account';

const genAuth = (studentID, password) => {
  const auth = utils.str2ab(`${studentID}:${password}`)
  return `Basic ` + Taro.arrayBufferToBase64(auth)
}

const proxy = async (params): Promise<any> => {
  if (!params.quite_mode) {
    Taro.showLoading({
      title: '加载中'
    })
  }
  
  try {
    const response = await Taro.request(params)
    
    if (!params.quite_mode) {
      Taro.hideLoading()
    }

    if (!utils.isObj(response)) {
      throw Error('')
    }

    if (response.statusCode != 200) {
      throw Error('服务器错误')
    }

    if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
      return response
    }

    if (response.data.code == -1 && !params.quite_mode) {
      utils._showModal({title: response.data.msg, content: response.data.data})
    }

    if (response.data.code == 1) {
      return response
    }

    if(params.quite_mode) {
      Taro.showToast({icon: 'none', title: response.data.msg})
      console.warn('Request error: ', response.data.msg)
    }

    return response
  } catch(e) {
    if (!params.quite_mode) {
      Taro.hideLoading()
      utils._showModal({title: '提示', content: '服务器暂时出了点问题'})
    } else {
      Taro.showToast({title: '服务器暂时出了点问题', icon: 'none'})
    }
  }
}

const notice = (params) => {
  params = {
    url: api.notice,
    quite_mode: true,
  }
  return proxy(params)
}

const authProxy = async (params) => {
  params.header = params.header || {}
  
  if (params.type && params.type === 'lib') {
    params.header.Token = params.opacToken || Taro.getStorageSync('opacToken')
  }

  params.header.Authorization = genAuth(params.studentID, params.password)
  
  return proxy(params)
}

const _getAuth = () => {
  let account = global.cache.Get('account')
  if (!account) {
    account = Account.Get()
  }
  return account
}

const jwAuth = async (params) => {
  const account = _getAuth()
  if (!account.jwPassword) {
    Taro.showModal({title: '提示', content: '还未绑定教务账号', showCancel: false})
    return
  }
  params = Object.assign(params, {studentID: account.studentID, password: account.jwPassword})
  return authProxy(params)
}

const cardAuth = async (params) => {
  const account = _getAuth()
  if (!account.cardPassword) {
    Taro.showModal({title: '提示', content: '还未绑定校园卡账号', showCancel: false})
    return
  }
  params = Object.assign(params, {studentID: account.studentID, password: account.cardPassword})
  return authProxy(params)
}

const jwVerify = async (params) => {
  params.url = api.jwVerify
  return authProxy(params)
}

const cardVerify = async (params) => {
  params.url = api.cardVerify
  return authProxy(params)
}

const jwScores = async ({year, semester}) => {
  let params = {
    url: api.jwScore,
    data: {
      year: year,
      semester: semester,
    },
  }
  return jwAuth(params)
}

const jwSchedule = async ({year, semester}) => {
  let params = {
    url: api.jwSchedule,
    data: {
      year: year,
      semester: semester,
    },
  }
  return jwAuth(params)
}

const cardBalance = async (params) => {
  params.url = api.cardBalance
  return cardAuth(params)
}

const cardTransaction = async ({startDate, endDate}) => {
  const params = {
    url: api.cardTransaction,
    data: {
      startDate: startDate,
      endDate: endDate,
    }
  }
  return cardAuth(params)
}

const electricbuyRecord = async (params) => {
  params.url = api.electricBuyRecord
  return proxy(params)
}

const electricUsedRecord = async (params) => {
  params.url = api.electricUsedRecord
  return proxy(params)
}

const libSearch = async ({keyword, page}) => {
  let params = {
    url: api.libSearch,
    data: {
      keyword: keyword,
      page: page,
    }
  }
  return proxy(params)
}

const libBookInfo = async ({isbn, marc_no}) => {
  let params = {
    url: api.libBookInfo,
    quite_mode: true,
    data: {
      isbn: isbn,
      marc_no: marc_no,
    }
  }
  return proxy(params)
}

const libBookDetail = async ({isbn, marc_no}) => {
  let params = {
    url: api.libBookDetail,
    data: {
      isbn: isbn,
      marc_no: marc_no,
    }
  }
  return proxy(params)
}

const libBookCover = async (url: string) => {
  let params = {
    url: api.libBookCover,
    quite_mode: true,
    data: {
      url: url,
    }
  }
  return proxy(params)
}

const libReaderCaptcha = async ({opacToken}) => {
  let params = {
    opacToken: opacToken,
    header: {Token: opacToken},
    url: api.libReaderCaptcha,
  }
  return proxy(params)
}

const libReaderLogin = async ({studentID, password, captcha, opacToken}) => {
  let params = {
    type: 'lib',
    url: api.libReaderLogin,
    studentID: studentID,
    password: password,
    opacToken: opacToken,
    data: {
      captcha: captcha,
    }
  }
  return authProxy(params)
}

const libReaderInfo = async ({quite_mode}) => {
  let params = {
    type: 'lib',
    quite_mode: quite_mode,
    url: api.libReaderInfo,
  }
  return authProxy(params)
}

const libReaderRenew = async ({captcha, barcode, check}) => {
  let params = {
    type: 'lib',
    data: { captcha, barcode, check },
    url: api.libReaderRenew,
  }
  return authProxy(params)
}

const libReaderRenewCheck = async ({barcode, quite_mode}) => {
  let params = {
    type: 'lib',
    data: { barcode },
    quite_mode: quite_mode,
    url: api.libReaderRenewCheck,
  }
  return authProxy(params)
}

const libReaderCurrentCheckout = async ({quite_mode}) => {
  let params = {
    type: 'lib',
    quite_mode: quite_mode,
    url: api.libReaderCurrentCheckout,
  }
  return authProxy(params)
}

const libReaderCheckoutRecord = async ({quite_mode}) => {
  let params = {
    type: 'lib',
    quite_mode: quite_mode,
    url: api.libReaderCheckoutRecord,
  }
  return authProxy(params)
}

export default {
  notice,

  jwVerify,
  jwScores,
  jwSchedule,

  cardVerify,
  cardBalance,
  cardTransaction,

  electricbuyRecord,
  electricUsedRecord,

  libSearch,
  libBookInfo,
  libBookDetail,
  libBookCover,

  libReaderCaptcha,
  libReaderLogin,
  libReaderInfo,
  libReaderRenew,
  libReaderRenewCheck,
  libReaderCurrentCheckout,
  libReaderCheckoutRecord,
}