import Taro from '@tarojs/taro'

const replaceToChinese = (num: number): string => {
  enum days {
    '日'=0,
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
  }
  return days[num]
}


// Convert string to array buffer
// See https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
// And.. The code has been modified for some reasons for some bugs
const str2ab = (str) => {
  let buf = new ArrayBuffer(str.length*1); // 2 bytes for each char
  let bufView = new Uint8Array(buf)
  for (let i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

const isObj = (obj: any): Boolean => {
  // console.info(`Object Judgement Result:`, typeof obj)
  return typeof obj !== "undefined"
}

const _showModal = ({title = '提示', content}) => {
  Taro.showModal({
    title: title,
    content: content,
    showCancel: false,
  })
}

const setStorage = (obj) => {
  if (!isObj(obj)) {
    return
  }

  for (let key in obj) {
    Taro.setStorageSync(key, obj[key])
  }
}

const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const deltaDate = (deltaDay: number): Date => {
  let now: Date = new Date()
  now.setDate(now.getDate() + deltaDay)
  return now
}

const openNavModal = async (content, url) => {
  const res = await Taro.showModal({title: '提示', content: content, showCancel: true})
  if (res.cancel) {
    return
  }
  Taro.navigateTo({url: url})
}

const isTokenValid = (response) => {
  if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
    return false
  }
  return true
}

export default {
  str2ab,
  isObj,
  _showModal,
  setStorage,
  deltaDate,
  formatTime,
  formatNumber,
  openNavModal,
  isTokenValid,
  replaceToChinese,
}