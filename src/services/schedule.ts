import Taro from '@tarojs/taro'

import account from './account'

import utils from '../utils/utils'
import request from '../utils/request'

interface ISchedule {
  index: Array<number>
  courseName: string,
  flex: number,
}

class Schedule {
  static getSchoolStartDate () {
    return Taro.getStorageSync('schoolStartDate')
  }
  
  static async getCurrWeek (refresh = false)  {

    let schoolStartDate: string = this.getSchoolStartDate()

    if (refresh || !schoolStartDate) {
      const res = await request.jwSchoolStartDate()
      if (!res) { return }
      schoolStartDate = res.data.data.date
    }

    Taro.setStorageSync('schoolStartDate', schoolStartDate)

    return Math.ceil((new Date().getTime() - new Date(schoolStartDate).getTime()) / (1000 * 3600 * 24 * 7))
  }
  
  static getDayDate (week) {
    const schoolStartDate: Date = new Date(this.getSchoolStartDate())
    const days: Array<any> = []
  
    schoolStartDate.setDate(schoolStartDate.getDate() + (week - 1) * 7 - 1)
  
    for (let i = 0; i < 7; i ++) {
      const timestamp = schoolStartDate.setDate(schoolStartDate.getDate() + 1)
      const datetime = new Date(timestamp)
      days.push({date: (datetime.getMonth() + 1) + '-' + datetime.getDate(), day: '周' + utils.replaceToChinese(datetime.getDay()), dayInt: datetime.getDay()})
    }
  
    return days
  }

  static colors = [
    'rgb(196, 98, 67)', // 照柿
    'rgb(208, 16, 76)', // 韓紅花
    'rgb(0, 137, 108)', // 青竹
    'rgb(180, 165, 130)', // 利休白茶
    'rgb(58, 143, 183)', // 千草
    'rgb(138, 107, 190)', // 藤紫
    'rgb(148, 122, 109)', // 胡桃
    'rgb(147, 150, 80)', // 柳茶
    'rgb(144, 180, 75)', // 鶸萌黄
    'rgb(51, 103, 116)', // 錆御納戸
    'rgb(38, 135, 133)', // 青碧
    'rgb(34, 125, 81)', // 緑
  ]

  static timeTable = [
    ['08:20', '09:05'],
    ['09:15', '10:00'],

    [
      ['10:20', '10:30'],
      ['11:05', '11:15'],
    ],

    [
      ['11:15', '11:25'],
      ['12:00', '12:10'],
    ],

    ['14:00', '14:45'],
    ['14:55', '15:40'],

    ['16:00', '16:45'],
    ['16:55', '17:40'],

    ['19:35', '20:20'],
    ['20:30', '21:15'],

    ['21:25', '22:10']
  ]

  static notCurrWeekCourseColor = 'rgba(120,125,123, 0.5)' // 素鼠

  static async Get (year: number = 0, semester: number = 0) {
    if (!year || !semester) {
      const ret = account.calYearSemester()
      year = ret['year']
      semester = ret['semester']
    }

    const response = await request.jwSchedule({year: year, semester: semester})
    if (!response.data || response.data.data.code == -1) {
      return false
    }
    
    Taro.setStorageSync('schedule', response.data.data.schedule)
    Taro.showToast({title: '获取课表成功', icon: "none"})
    return true
  }

  static GetFormStorage () {
    const schedule = Taro.getStorageSync('schedule')
    if (!schedule) {
      return false
    }
    return schedule
  }

  static initFrame () {
    /*
    生成一个 8 * 12 的矩阵
    矩阵第一行是 [1, 2, 3, 4, 5, 6, 7, 8,  9, 10, 11, 12]
    其余行均是 ISchedule * 12 的数组
    */
    let schedule: Array<any> = [[1, 2, 3, 4, 5, 6, 7, 8,  9, 10, 11, 12]]
    for (let i = 0; i < 7; i++) {
      let courseBlock: Array<ISchedule> = []
      for (let j = 0; j < 12; j++) {
        courseBlock[j] = {
          index: [i+1, j+1],
          courseName: '',
          flex: 1,
        }
      }
      schedule.push(courseBlock)
    }
    return schedule
  }

  static InitSchedule (rawSchedule: Array<any>, week: number = -1, day: number = -1, displaNotCurrentWeekCourse: boolean = false) {
    const sameScheduleSameColor = {}
    const colorLength = this.colors.length
    let schedule: Array<any> = []

    const setting = Taro.getStorageSync('setting')
    displaNotCurrentWeekCourse = displaNotCurrentWeekCourse || setting.displaNotCurrentWeekCourse

    if (day === -1) {
      schedule = this.initFrame()
    }
    
    let colorIndex = 0

    // 初始化课程表
    for (let s of rawSchedule) {
      let currWeekCourse = false

      if (!s.during) {
        continue
      }

      const allWeek = s.during.split(',')
      s.firstWeek = parseInt(allWeek[0])

      // 判断是否为本周课程或下周课程
      for (let w of allWeek) {
        let wInt = parseInt(w)
        if (wInt == week) {
          currWeekCourse = true
          break
        } else if (wInt > week) {
          break
        }
      }

      s.sessionArray = s.session.split(',')
      s.currWeekFlag = currWeekCourse

      s.timeTable = this.getTimeTable(s).join('-')
      s.sessionText = s.sessionArray[0] + '-' + s.sessionArray[s.sessionArray.length-1]

      // 调用来自于首页的今日课表
      if (day !== -1) {
        // 如果是本周课程且是当日课程
        if (parseInt(s.day) == day &&  currWeekCourse) {
          schedule.push(s)
        }
        // 无论如何，跳过本次循环
        continue
      }

      // 显示非本周课程设置未开启, 跳过非本周课程
      if (!displaNotCurrentWeekCourse && !currWeekCourse) {
        continue
      }
      
      const firstSession = s.sessionArray[0] - 1
      const classInCurrCell = schedule[parseInt(s.day)][firstSession]

      // 计算课程首周与本周的周差
      const sDistance = Math.abs(s.firstWeek - week)
      const cDistance = Math.abs(classInCurrCell.firstWeek - week)
      
      // 课程矩阵中将要放置的格子已经有课程，以下两个情况跳过渲染
      // 1. 格子中的课程是本周要上的课
      // 2. 格子中的课程首周比当前课程的要晚
      if (classInCurrCell.flex > 1 && (classInCurrCell.currWeekFlag || sDistance > cDistance)) {
        continue
      }

      let x = parseInt(s.day)
      let y = firstSession

      // 判断当前cell是否已经被划分为不显示的格子，即已经被某个课程撑开而隐藏，但是有可能该课程撑开的大小会占用到当前循环课程的位置
      if (classInCurrCell.flex === 0) {
        // 跳过虽然格子被占用，但是当前课程不是本周课程
        if (!s.currWeekFlag) {
          continue
        }

        // 向上寻找占用格子的课程
        while ((--y) >= 0) {
          if (schedule[x][y].flex > 1) {
            // 缩小课程格子
            schedule[x][y].flex -= s.sessionArray.length
          }
        }
      }

      s.duringText = allWeek[0] + '-' + allWeek[allWeek.length - 1] // start week to end week

      // 课程块随机上色，并为同一课程上相同色
      if (currWeekCourse) {
        s.color = sameScheduleSameColor[s.courseName] || this.colors[(colorIndex++) % colorLength]
        sameScheduleSameColor[s.courseName] = s.color
      } else {
        s.color = this.notCurrWeekCourseColor
      }
      
      schedule = this.doFlex(schedule, s)
    }

    return schedule
  }

  static getTimeTable (s) {
    const sessionArray = s.sessionArray
    const startSession = sessionArray[0]
    const endSession = sessionArray[sessionArray.length-1]
    const isSpecial = s.location.match(/二教|实验|室/g) === null ? 0 : 1

    const getTime = (session, isStart) => {
      const sessionInt = parseInt(session)
      const tmp = this.timeTable[sessionInt - 1]

      if (sessionInt === 3 || sessionInt === 4) {
        return tmp[isStart ? 0 : 1][isSpecial]
      }

      return tmp[isStart ? 0 : 1]
    } 

    const startTime = getTime(startSession, true)
    const endTime = getTime(endSession, false)

    return [startTime, endTime]
  }

  static doFlex (schedule, s) {
    const dayInt = parseInt(s.day)

    // 将与该课程上课节数有关的 cell 的 flex 置 0
    s.sessionArray.forEach((i) => {
      schedule[dayInt % 8][i - 1].flex = 0;
    })

    // 用于课程第一个 cell 的 flex 值，予以撑开所占节数
    s.flex = s.sessionArray.length
    // 将与该课程上课节数有关的第一个 cell 替换为 该课程
    schedule[dayInt % 8][s.sessionArray[0] - 1] = s

    return schedule
  }
}

export default Schedule