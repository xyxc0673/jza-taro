import Taro, {Component, Config} from '@tarojs/taro'
import {View, Form, Image, Button, Picker, Input, Text} from '@tarojs/components'

import FloatLayout from '../../../components/float-layout'

import './schedule.scss'

import global from '../../../utils/global'
import Schedule from '../../../services/schedule'
import { ISetting } from '../../../interfaces/setting';

const questionUrl = require('../../../asserts/images/question.svg')

// interface INewCourse {
//   name: string,
//   teacher: string,
//   location: string,
//   sessionStart: string,
//   sessionEnd: string,
//   weekStart: string,
//   weekEnd: string,
// }

interface ISchedule {
  courseName: string,
  location: string,
  color: string,
  teacher: string,
  flex: number,
}

interface IState {
  schedule: Array<Array<ISchedule>>,
  week: number,
  day: number,
  date: string,
  dayDate: Array<any>,
  showAddCourseFloatLayout: boolean,

  startX: number,

  newCourseName: string,
  newCourseTeacher: string,
  newCourseLocation: string,
  newCourseSessionStart: number,
  newCourseSessionEnd: number,
  newCourseWeekStart: number,
  newCourseWeekEnd: number,

  newCourseDayRange: Array<any>,
  newCourseDaySelected: number,
  newCourseDayText: string,

  newCourseOddRange: Array<any>,
  newCourseOddSelected: number,
  newCourseOddText: string,

  setting: ISetting,
}

export default class Core extends Component {
  config: Config = {
    navigationBarTitleText: ''
  }
  
  state: IState = {
    schedule: [],
    week: 0,
    day: 0,
    date: '',
    dayDate: [],
    showAddCourseFloatLayout: false,

    startX: 0,

    newCourseName: '',
    newCourseTeacher: '',
    newCourseLocation: '',
    newCourseSessionStart: 0,
    newCourseSessionEnd: 0,
    newCourseWeekStart: 0,
    newCourseWeekEnd: 0,

    newCourseDayRange: [
      {
        key: '1',
        name: '一',
      },
      {
        key: '2',
        name: '二',
      },
      {
        key: '3',
        name: '三',
      },
      {
        key: '4',
        name: '四',
      },
      {
        key: '5',
        name: '五',
      },
      {
        key: '6',
        name: '六',
      },
      {
        key: '7',
        name: '日',
      },
    ],
    newCourseDaySelected: 0,
    newCourseDayText: '一',

    newCourseOddRange: [
      {
        key: '0',
        name: '非单双周',
      },
      {
        key: '1',
        name: '单周',
      },
      {
        key: '2',
        name: '双周',
      }
    ],
    newCourseOddSelected: 0,
    newCourseOddText: '非单双周',

    setting: {} as ISetting,
  }

  async componentWillMount () {
    const from = this.$router.params.from
    const title = this.$router.params.title

    Taro.setNavigationBarTitle({title: title || '我的课程表'})

    const currWeek = await Schedule.getCurrWeek()

    if (currWeek === undefined ) { return }

    this.init(from, currWeek)
  }

  componentDidMount () {
    Taro.eventCenter.on('scheduleCoreRemount', () => {
      this.componentWillMount()
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  init (from, week: number) {
    let rawSchedule = []
    let customSchedule = []

    if (from === "recommend") {
      rawSchedule = global.cache.Get('recommendSchedule')
    } else {
      rawSchedule = Schedule.GetFormStorage()
      customSchedule = Taro.getStorageSync('customSchedule')
    }


    const newSchedule = rawSchedule.concat(customSchedule)

    const newState = {}
    const params = this.$router.params

    if (params && params.from === 'search') {
      newState['showAddCourseFloatLayout'] = true
      this.$router.params.from = ''
    }

    newState['schedule'] = Schedule.InitSchedule(newSchedule, week, -1, from === "recommend")

    newState['week'] = week
    newState['day'] = new Date().getDay(),
    newState['date'] = `${new Date().getMonth() + 1}-${new Date().getDate()}`
    newState['dayDate'] = Schedule.getDayDate(week)
    newState['setting'] = Taro.getStorageSync('setting')

    this.setState(newState)
  }

  handleInputChange (key, e) {
    const keys = ['newCourseSessionStart','newCourseSessionEnd', 'newCourseWeekStart', 'newCourseWeekEnd']
    const value = keys.includes(e.target.dataset.eHandleinputchangeAA) ? parseInt(e.detail.value) : e.detail.value
    this.setState({[`${key}`]: value})
  }

  gotoManageCustom () {
    Taro.navigateTo({url: '/pages/edu/schedule/custom?from=schedule'})
  }

  handleAddCourseHelp () {
    Taro.showModal({title: '帮助', content: '目前在自定义课程时，如果新课程与原有课程有时间上的冲突，新课程会覆盖原有课程，删除新课程即可恢复。', showCancel: false})
  }

  handleTouchStart (e) {
    if (!e.changedTouches[0]) {
      return
    }
    this.setState({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })
  }

  handleTouchEnd (e) {
    const { week, startX } = this.state
    const touchMoveX = e.changedTouches[0].clientX

    if (Math.abs(touchMoveX - startX) < 100) {
      return
    }

    const from = this.$router.params.from

    const deltaX = touchMoveX - startX

    if (deltaX > 0 && week - 1 < 1 || deltaX < 0 && week  + 1 > 20) {
      Taro.showToast({title: '到头了', icon: 'none'})
      return
    }

    if (deltaX < 0) {
      this.init(from, week + 1)
    } else if (touchMoveX > startX) {
      this.init(from,week - 1)
    }
  }
  
  showAddCourse (value, course) {
    const from = this.$router.params.from

    if (from === 'recommend') {
      this.gotoManageCustom()
      return  
    }

    let newState = {}

    if (course.index) {
      const courseIndex = course.index
      newState = {
        newCourseDay: courseIndex[0].toString(),
        newCourseWeekStart: 2,
        newCourseWeekEnd: 16,
        newCourseSessionStart: courseIndex[1],
        newCourseSessionEnd: courseIndex[1]+1,
        newCourseDaySelected: courseIndex[0]-1,
        newCourseDayText: this.state.newCourseDayRange[courseIndex[0]-1].name
      }
    }

    newState['showAddCourseFloatLayout'] = value

    this.setState(newState)
  }

  handleOddChange (e) {
    this.setState( (prevState: IState) => ({
      newCourseOddSelected: e.detail.value,
      newCourseOddText: prevState.newCourseOddRange[e.detail.value].name
    }))
  }

  handleDayChange (e) {
    this.setState( (prevState: IState) => ({
      newCourseDaySelected: parseInt(e.detail.value),
      newCourseDayText: prevState.newCourseDayRange[e.detail.value].name
    }))
  }

  handleAddCourse () {
    const {newCourseName, newCourseTeacher, newCourseLocation, newCourseSessionStart, newCourseSessionEnd, newCourseWeekStart, newCourseWeekEnd, newCourseDaySelected, newCourseOddSelected} = this.state
    let sessionArray: Array<number> = []
    let weekArray: Array<number> = []

    const checkLength = (fields, length: number = 2) => {
      let flag = true
      try {
        fields.forEach((field) => { 
          if (field.length < length) { throw Error('') }
        })
      } catch (e) {
        flag = false
      }
      return flag
    }

    const checkBetween = (fields, start, end) => {
      let flag = true
      for (let i = 0; i < fields.length; i ++) {
        const field = parseInt(fields[i])
        if (isNaN(field)) { flag = false }
        if (field < start || field > end) { flag = false }
        if (!flag) { break }
      }

      if (fields.length === 2) {
        if (fields[0] > fields[1]) {
          flag = false
        }
      }

      return flag
    }

    if (!checkLength([newCourseName], 1)) {
      Taro.showToast({title: '课程名称不能为空', icon: 'none'})
      return
    } else if (!checkBetween([newCourseSessionStart, newCourseSessionEnd], 1, 12)) {
      Taro.showModal({title: '提示', content: '节次的取值范围是 1 - 12, 并且起始节数需要小于或等于终止节数', showCancel: false})
      return
    } else if (!checkBetween([newCourseWeekStart, newCourseWeekEnd], 1, 22)) {
      Taro.showModal({title: '提示', content: '周次的取值范围是 1 - 22, 并且起始周数需要小于或等于终止周数', showCancel: false})
      return
    }

    for (let i = newCourseSessionStart; i <= newCourseSessionEnd; i ++) {
      sessionArray.push(i)
    }

    for (let i = newCourseWeekStart; i <= newCourseWeekEnd; i ++) {
      weekArray.push(i)
    }

    const newCourse = {
      courseName: newCourseName,
      teacher: newCourseTeacher,
      location: newCourseLocation,
      day: newCourseDaySelected + 1,
      oddOrEven: newCourseOddSelected,
      session: sessionArray.join(","),
      during: weekArray.join(","),
    }
    
    const customSchedule = Taro.getStorageSync('customSchedule')

    customSchedule.push(newCourse)

    this.setState({showAddCourseFloatLayout: false, newCourseName: '', newCourseTeacher: '', newCourseLocation: ''})
    Taro.setStorageSync('customSchedule', customSchedule)
    
    Taro.eventCenter.trigger('scheduleCoreRemount')
    Taro.eventCenter.trigger('indexRemount')
    Taro.showToast({title: '添加成功', icon: 'none'})

  }

  async handleCourseClick (course) {
    if (!course.courseName) {
      this.showAddCourse(true, course)
      return
    }

    let oddText = ''
    switch (course.oddOrEven) {
      case 0:
        oddText = '非单双周'
        break
      case 1:
        oddText = '单周'
        break
      case 2: 
        oddText = '双周'
        break
    }

    const contentArrary = [
      course.courseName,
      course.teacher,
      course.location,
      course.timeTable,
      course.duringText + ' 周',
    ]

    if (oddText !== '') {
      contentArrary.push(oddText)
    }

    const from = this.$router.params.from
    if (from === 'recommend') {
      contentArrary.push(course.courseNature)
      contentArrary.push(course.courseType)
      if (course.capacity !== '') {
        contentArrary.push(`容量：${course.capacity}人`)
      }
      if (course.enrollmentNumber !== '0') {
        contentArrary.push(`选课：${course.enrollmentNumber}人`)
      } 
    }
    
    const content: Array<any> = contentArrary.map((c, index, arrary) => {
      if (c === '') { return }
      return index != (arrary.length - 1) ? c + ' \\ ' : c
    })

    const res = await Taro.showModal({title: from === 'recommend' ? '加入到自定义课程': '', content: content.join(''), showCancel: from === 'recommend'})

    if (from === 'recommend' && res.confirm) {
      const customSchedule = Taro.getStorageSync('customSchedule')
      customSchedule.push(course)
      Taro.setStorageSync('customSchedule', customSchedule)
      Taro.showToast({'title': '添加成功', icon: 'none'})
    }
  }

  render () {
    const {schedule, dayDate, date, showAddCourseFloatLayout, setting} = this.state
    const transparent = setting.displayScheduleBg ? 'transparent' : ''
    const bgStyles = ['', 'blur']
    const scheduleBgStyle = setting.displayScheduleBg ? bgStyles[setting.displayScheduleBgStyle] : ''

    // 这里写得好不优雅，要怎么改
    const container = schedule.map((s, index) => {
      return (
        <View className={`col ${ index === 0 ? `title ${transparent}` : 'course'}`} key={index}>
          {
            index === 0
            ? s.map((sessionText, sessionIndex) => {
                return <View className='row session' key={sessionIndex}>{sessionText}</View>
              })
            : s.map((course, courseIndex) => {
                return course.flex != 0
                  ? (
                    <View className={`row course ${transparent}`} key={courseIndex} onClick={this.handleCourseClick.bind(this, course)} style={`background-color: ${course.color?course.color: ''};flex: ${course.flex}; padding: ${course.flex > 1 ? (course.flex - 1)*2 : 0}rpx 0.25rem`}>
                      <Text className='course-name'>{course.courseName}</Text><Text>{course.location}</Text>
                    </View>
                  )
                  : null
              })
          }
        </View>
      )
    })

    return (
      <View>
        <Image className={`bg ${scheduleBgStyle}`} src={setting.displayScheduleBgSource} mode='aspectFill'></Image>
        <View className={`header ${setting.displayScheduleBg && setting.displayScheduleHeaderTransparent ? 'transparent' : ''}`}>
          <View id='dayDateID' className='dayDate'>
            <View className='left-block'>{this.state.week}周</View>
            {dayDate.map((item, index) => {
              return (
                <View className='dayDate-item' key={index}>
                  <Text className='dayDate-item__day' style={`color:${item.date == date ? 'rgba(52, 142, 141, 0.9)': ''}`}>{item.day}</Text>
                  <Text className='dayDate-item__date' style={`color:${item.date == date ? 'rgba(52, 142, 141, 0.7)': ''}`}>{item.date}</Text>
                </View>
              )
            })}
          </View>
        </View>
        <View className={`container ${transparent}`} onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd}>{container}</View>
        <FloatLayout title='添加课程' isOpened={showAddCourseFloatLayout} onClose={this.showAddCourse.bind(this, false)}>
          <View className='padding20'>
            <Form className='form' onSubmit={this.handleAddCourse}>
              <View className='form-input'>
                <Text className='label'>名称</Text><Input value={this.state.newCourseName} onInput={this.handleInputChange.bind(this, 'newCourseName')} placeholder='课程名称' placeholderClass='form-input__placeholder' />
              </View>
              <View className='form-input'>
                <Text className='label'>教师</Text><Input value={this.state.newCourseTeacher} onInput={this.handleInputChange.bind(this, 'newCourseTeacher')} placeholder='任课教师' placeholderClass='form-input__placeholder'></Input>
              </View>
              <View className='form-input'>
                <Text className='label'>地点</Text><Input value={this.state.newCourseLocation} onInput={this.handleInputChange.bind(this, 'newCourseLocation')} placeholder='上课地点' placeholderClass='form-input__placeholder'></Input>
              </View>
              <View className='form-input'>
                <Text className='label'>星期</Text>
                <Picker mode='selector' range={this.state.newCourseDayRange} rangeKey='name' value ={this.state.newCourseDaySelected} onChange={this.handleDayChange}>
                  <Input value={`${this.state.newCourseDayText}`} disabled={true} placeholder='星期' placeholderClass='form-input__placeholder'></Input>
                </Picker>
              </View>
              <View className='form-input'>
                <Text className='label'>节次</Text><Input type='number' value={`${this.state.newCourseSessionStart}`} onInput={this.handleInputChange.bind(this, 'newCourseSessionStart')} placeholder='上课节次' placeholderClass='form-input__placeholder'></Input>
                <Text className='label'>-</Text><Input type='number' value={`${this.state.newCourseSessionEnd}`} onInput={this.handleInputChange.bind(this, 'newCourseSessionEnd')} placeholder='上课节次' placeholderClass='form-input__placeholder'></Input>
              </View>
              <View className='form-input'>
                <Text className='label'>周次</Text><Input type='number' value={`${this.state.newCourseWeekStart}`} onInput={this.handleInputChange.bind(this, 'newCourseWeekStart')} placeholder='上课周次' placeholderClass='form-input__placeholder'></Input>
                <Text className='label bold'>-</Text><Input type='number' value={`${this.state.newCourseWeekEnd}`} onInput={this.handleInputChange.bind(this, 'newCourseWeekEnd')} placeholder='上课节次' placeholderClass='form-input__placeholder'></Input>
              </View>
              <View className='form-input'>
                <Text className='label'>单双</Text>
                <Picker mode='selector' range={this.state.newCourseOddRange} rangeKey='name' value ={this.state.newCourseOddSelected} onChange={this.handleOddChange}>
                  <Input disabled={true} value={this.state.newCourseOddText} placeholder='单双周' placeholderClass='form-input__placeholder' />
                </Picker>
              </View>
              <View className='tips'>
                <View className='manage' onClick={this.gotoManageCustom}>管理</View>
                <Image src={questionUrl} onClick={this.handleAddCourseHelp} />
              </View>
              <Button className='btn' formType='submit'>添加</Button>
            </Form>
          </View>
        </FloatLayout>
      </View>
    )
  }
}