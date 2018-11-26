import Taro from '@tarojs/taro'

import request from '../../utils/request'

import account from './account'

interface ISchedule {
  index: Array<number>
  course_name: string,
  flex: number,
}

class Schedule {
  static colors = [
    'rgba(196, 98, 67, 0.5)', // 照柿
    'rgba(208, 16, 76, 0.5)', // 韓紅花
    'rgba(0, 137, 108, 0.5)', // 青竹
    'rgba(180, 165, 130, 0.5)', // 利休白茶
    'rgba(58, 143, 183, 0.5)', // 千草
    'rgba(138, 107, 190, 0.5)', // 藤紫
    'rgba(148, 122, 109, 0.5)', // 胡桃
    'rgba(147, 150, 80, 0.5)', // 柳茶
    'rgba(144, 180, 75, 0.5)', // 鶸萌黄
    'rgba(51, 103, 116, 0.5)', // 錆御納戸
    'rgba(38, 135, 133, 0.5)', // 青碧
    'rgba(34, 125, 81, 0.5)', // 緑
  ]

  static async Get (year: number = 0, term: number = 0) {
    if (!year || !term) {
      const ret = account.calYearTerm()
      year = ret['year']
      term = ret['term']
    }

    const response = await request.jwSchedule(year, term)
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
          course_name: '',
          flex: 1,
        }
      }
      schedule.push(courseBlock)
    }
    return schedule
  }

  static InitSchedule (rawSchedule: Array<any>, week: number = -1, day: number = -1) {
    const sameScheduleSameColor = {}
    const colorLength = this.colors.length
    let schedule: Array<any> = []

    if (day === -1) {
      schedule = this.initFrame()
    }
    
    let colorIndex = 0

    // 初始化课程表
    for (let s of rawSchedule) {
      let thisWeekCourse = false

      if (!s.during) {
        continue
      }

      const allWeek = s.during.split(',')

      // 判断是否为本星期课程
      allWeek.forEach((w: string) => {
        let wInt = parseInt(w)
        if (wInt == week) {
          thisWeekCourse = true
          return
        }
      })

      if (!thisWeekCourse || (day !== -1 && parseInt(s.day) != day)) {
        continue
      }

      s.duringText = allWeek[0] + '-' + allWeek[allWeek.length - 1] // start week to end week

      const sessionArrary = s.session.split(',')
      s.sessionText = sessionArrary[0] + '-' + sessionArrary[sessionArrary.length - 1] // start seesion to end session

      if (day === -1) {
        // 课程块随机上色，并为同一课程上相同色
        const colorBefore = sameScheduleSameColor[s.course_name]

        if (!colorBefore) {
          s.color = this.colors[(colorIndex++) % colorLength]
          sameScheduleSameColor[s.course_name] = s.color
        } else {
          s.color = colorBefore
        }
        
        schedule = this.doFlex(schedule, s)
      } else {
        schedule.push(s)
      }
    }

    return schedule
  }

  static doFlex (schedule, s) {
    // 将与该课程上课节数有关的 cell 的 flex 置 0
    const sessionArray = s.session.split(',')
    const dayInt = parseInt(s.day)
    
    s.flex = sessionArray.length // 用于课程第一个 cell 的 flex 值，予以撑开所占节数

    sessionArray.forEach((i) => {
      schedule[dayInt % 8][i - 1].flex = 0;
    })

    // 将与该课程上课节数有关的第一个 cell 替换为 该课程
    schedule[dayInt % 8][sessionArray[0] - 1] = s

    return schedule
  }


}

export default Schedule