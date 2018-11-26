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

    if (response.data.code == 1) {
      return response
    }

    if(params.quite_mode) {
      Taro.showToast({icon: 'none', title: response.data.msg})
      console.warn('Request error: ', response.data.msg)
    }

    if (response.data.code == -1 && !params.quite_mode) {
      utils._showModal(response.data.msg)
    }

    return response
  } catch(e) {
    if (!params.quite_mode) {
      Taro.hideLoading()
      utils._showModal('服务器暂时出了点问题')
    } else {
      Taro.showToast({title: '服务器暂时出了点问题', icon: 'none'})
    }
  }
}

const notice = (params) => {
  params = {
    url: api('notice'),
    quite_mode: true,
  }
  return proxy(params)
}

const authProxy = async (params) => {
  params.header = params.header || {}
  params.header.Authorization = genAuth(params.studentID, params.password)
  return proxy(params)
}

const _getAuth = () => {
  let account = global.cache.get('account')
  if (!account) {
    account = Account.get()
  }
  return account
}

const jwAuth = async (params) => {
  let account = _getAuth()
  if (!account.jwPassword) {
    Taro.showModal({title: '提示', content: '还未绑定教务账号', showCancel: false})
    return
  }
  params = Object.assign(params, {studentID: account.studentID, password: account.jwPassword})
  return authProxy(params)
}

const cardAuth = async (params) => {
  let account = _getAuth()
  if (!account.cardPassword) {
    Taro.showModal({title: '提示', content: '还未绑定校园卡账号', showCancel: false})
    return
  }
  params = Object.assign(params, {studentID: account.studentID, password: account.cardPassword})
  return authProxy(params)
}

const jwVerify = async (params) => {
  params.url = api('jwVerify')
  return authProxy(params)
}

const cardVerify = async (params) => {
  params.url = api('cardVerify')
  return authProxy(params)
}

const jwScores = async (year, semester) => {
  let params = {
    url: api('jwScore'),
    data: {
      year: year,
      semester: semester,
    },
  }
  return jwAuth(params)
}

const jwSchedule = async (year, semester) => {
  let params = {
    url: api('jwSchedule'),
    data: {
      year: year,
      semester: semester,
    },
  }
  return jwAuth(params)
}

const cardBalance = async (params) => {
  params.url = api('cardBalance')
  return cardAuth(params)
}

const cardTransaction = async (startDate, endDate) => {
  const params = {
    url: api('cardTransaction'),
    data: {
      startDate: startDate,
      endDate: endDate,
    }
  }
  return cardAuth(params)
}

const electricbuyRecord = async (params) => {
  params.url = api('libSearch')
  return proxy(params)
}

const electricUsedRecord = async (params) => {
  params.url = api('electricUsedRecord')
  return proxy(params)
}

const libSearch = async (keyword, page) => {
  let params = {
    url: api('libSearch'),
    data: {
      keyword: keyword,
      page: page,
    }
  }
  return proxy(params)
}

const libBookInfo = async (isbn: string, marc_no: string) => {
  let params = {
    url: api('libBookInfo'),
    quite_mode: true,
    data: {
      isbn: isbn,
      marc_no: marc_no,
    }
  }
  return proxy(params)
}

const libBookDetail = async (isbn: string, marc_no: string) => {
  let params = {
    url: api('libBookDetail'),
    data: {
      isbn: isbn,
      marc_no: marc_no,
    }
  }
  return proxy(params)
}

const libBookCover = async (url: string) => {
  let params = {
    url: api('libBookCover'),
    quite_mode: true,
    data: {
      url: url,
    }
  }
  return proxy(params)
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
}