import Taro from '@tarojs/taro'

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

const getWeek = (): number => {
  const schoolOpenDate: string = Taro.getStorageSync('schoolOpenDate')
  const start: number = new Date(schoolOpenDate).getTime()
  const end: number = new Date().getTime()
  const delta: number = end - start
  return Math.floor(delta / (1000 * 3600 * 24 * 7))
}

const getDayDate = (week): Array<any> => {
  const schoolOpenDate: Date = new Date(Taro.getStorageSync('schoolOpenDate'))
  const days: Array<any> = []

  schoolOpenDate.setDate(schoolOpenDate.getDate() + (week) * 7 - 1)

  for (let i = 0; i < 7; i ++) {
    let timestamp = schoolOpenDate.setDate(schoolOpenDate.getDate() + 1)
    let date = new Date(timestamp)
    days.push({date: (date.getMonth() + 1) + '-' + date.getDate(), day: '周' + replaceToChinese(date.getDay()), dayInt: date.getDay()})
  }

  return days
}

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

export default {
  str2ab,
  isObj,
  _showModal,
  setStorage,
  deltaDate,
  formatTime,
  formatNumber,
  getWeek,
  getDayDate,
}