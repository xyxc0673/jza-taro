import Taro, { Component, Config } from '@tarojs/taro'
import { View, Form, Label, Text, Picker, Image, Button, Icon } from '@tarojs/components'

import './recommend.scss'

import FloatLayout from '../../../components/float-layout'
import Panel from '../../../components/panel'

import api from '../../../utils/api'
import data from '../../../utils/data'
import utils from '../../../utils/utils'
import request from '../../../utils/request'
import global from '../../../utils/global'
import Account from '../../../services/account';

const questionUrl = require('../../../asserts/images/question.svg')

export default class Sample extends Component {
  config: Config = {
    navigationBarTitleText: '班级课表'
  }
  
  state = {
    yearSemesterRange: data.yearSemesterRange,
    collegeRange: data.collegeRange,
    majorRange: [] as Array<any>,
    gradeRange: data.gradeRange,

    yearSemesterValue: [0, 0],
    collegeValue: -1,
    majorValue: 0,
    gradeValue: 3,

    yearSemesterText: '',
    collegeText: '请选择学院',
    majorText: '',
    gradeText: '',

    yearSemesterSelected: [] as Array<any>,
    collegeSelectedKey: '-1',
    majorSelectedKey: '-1',
    gradeSelectedKey: '',
    
    allClass: [] as Array<any>,
    recommendSchedules: [] as Array<any>,
    isLogin: false,
    openHelpFloatLayout: false,
    showSearchPanel: false,
  }

  componentWillMount () {
    this.loadRecommendSchedules ()
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    if (global.cache.Get('from') === 'bind') {
      this.componentDidMount()
      global.cache.Set('from', '')
    }
  }

  componentDidHide () { }

  loadRecommendSchedules () {
    const res = Taro.getStorageSync('recommendSchedules')
    const recommendSchedules: Array<any> = []
    const tmpScheduleMap = {}

    for (let i = 0; i < res.length; i ++) {
      const s = res[i]
      const schedules = tmpScheduleMap[s.yearSemester] || []

      Object.assign(s, {index: i})
      
      schedules.push(s)

      tmpScheduleMap[s.yearSemester] = schedules
    }

    for (let k in tmpScheduleMap){
      recommendSchedules.push({
        key: k,
        schedules: tmpScheduleMap[k]
      })
    }
    this.setState({recommendSchedules: recommendSchedules})
  }

  initSearchPanel () {
    const { yearSemesterRange, gradeRange, gradeValue } = this.state

    const { year, semester } = Account.calYearSemester()
    
    yearSemesterRange[0] = this.generateYearOptions('00' + year.toString().slice(2, 4))

    const yearSemesterValue = [
      this.judgeRealIndex(yearSemesterRange[0], year),
      this.judgeRealIndex(yearSemesterRange[1], semester)
    ]

    const yearSemesterState = this.processYearSemesterChange(yearSemesterRange, yearSemesterValue[0], yearSemesterValue[1])

    const grade = gradeRange[gradeValue]

    const gradeSelectedKey = grade.key

    const newState = Object.assign({}, yearSemesterState, {
      gradeText: grade.name,
      gradeSelectedKey: gradeSelectedKey,
      yearSemesterValue: yearSemesterValue,
    })

    this.setState(newState)
  }

  openHelp (value) {
    this.setState({openHelpFloatLayout: value})
  }

  transToRange (obj, key1, key2) {
    const range: Array<any> = []
    for (let o of obj) {
      range.push(
        {
          key: o[key1],
          name: o[key2],
        }
      )
    }
    return range
  }

  judgeRealIndex = (originList, targetValue) => {
    for (let i = 0; i < originList.length; i++) {
      if (originList[i].key === targetValue.toString()) {
        return i
      }
    }
    return 0
  }

  async checkLoginState (response) {
    if (!utils.isTokenValid(response)) {
      await Taro.showModal({title: '提示', content: '登录已经过期，请点击确定重新登录', showCancel: false})
      this.login()
      return false
    }
    return true
  }

  async handleSubmit () {
    const { collegeSelectedKey, gradeSelectedKey, majorSelectedKey, isLogin } = this.state

    if (!isLogin) {
      utils.openNavModal('还未绑定教务账号，是否前往绑定？', '/pages/common/bind/index?from=requestAuth')
      return
    }

    if (collegeSelectedKey === '-1') {
      Taro.showModal({title: '提示', content: '还未选择学院', showCancel: false})
      return
    }

    this.getClass(collegeSelectedKey, gradeSelectedKey, majorSelectedKey)
  }

  handleYearSemesterChange (e) {
    const { yearSemesterRange } = this.state
    const newState = this.processYearSemesterChange(yearSemesterRange, e.detail.value[0], e.detail.value[1])

    this.setState(newState)
  }

  processYearSemesterChange (rangeObj, yearIndex, semesterIndex) {
    const year = rangeObj[0][yearIndex]
    const semester = rangeObj[1][semesterIndex]
    return {yearSemesterText: `${year.name.slice(0, 2)} ${semester.name} (${year.name.slice(-10, -1)}-${semester.key})`, yearSemesterSelected: [year.key, semester.key]}
  }

  handleCollegeChange (e) {
    const { collegeRange, gradeSelectedKey, yearSemesterRange, yearSemesterValue, yearSemesterSelected } = this.state
    const college = collegeRange[e.detail.value]
    
    yearSemesterRange[0] = this.generateYearOptions(college.key.slice(0, 2) + gradeSelectedKey.slice(2, 4))
    yearSemesterValue[0] = this.judgeRealIndex(yearSemesterRange[0], yearSemesterSelected[0])
    
    const newState = this.processYearSemesterChange(yearSemesterRange, yearSemesterValue[0], yearSemesterValue[1])

    Object.assign(newState, {collegeValue: e.detail.value, collegeSelectedKey: college.key, collegeText: college.name})
    
    this.setState(newState)

    this.getMajor(college.key, gradeSelectedKey)
  }

  handleMajorChange (e) {
    const { majorRange } = this.state
    const major = majorRange[e.detail.value]

    this.setState({majorValue: e.detail.value, majorSelectedKey: major.key, majorText: major.name})
  }

  handleGradeChange (e) {
    const { gradeRange, yearSemesterRange, yearSemesterValue, yearSemesterSelected, collegeSelectedKey } = this.state
    const grade = gradeRange[e.detail.value]
    
    yearSemesterRange[0] = this.generateYearOptions((collegeSelectedKey.slice(0, 2) || '00') + grade.key.slice(2, 4))
    yearSemesterValue[0] = this.judgeRealIndex(yearSemesterRange[0], yearSemesterSelected[0])
    
    const newState = this.processYearSemesterChange(yearSemesterRange, yearSemesterValue[0], yearSemesterValue[1])

    Object.assign(newState, {
      yearSemesterRange: yearSemesterRange,
      gradeValue: e.detail.value,
      gradeSelectedKey: grade.key,
      gradeText: grade.name,
    })

    this.setState(newState)
  }

  generateYearOptions (id) {
    const schoolYears = Account.calSchoolYears(id)
    const yearStrings = ["一", "二", "三", "四", "五"]

    let yearOptions = [] as Array<any>
    for(let i = 0; i < schoolYears.length; i ++) {
      let year = schoolYears[i]
      const obj = {
        key: year.toString(),
        name: `大${yearStrings[i]} (${year}-${year+1})`,
      }
      yearOptions.push(obj)
    }

    return yearOptions
  }

  async handleOnlineClick (index) {
    const { yearSemesterSelected, gradeSelectedKey, majorSelectedKey, allClass } = this.state

    const schedule = await this.getSchedule(yearSemesterSelected[0], yearSemesterSelected[1], gradeSelectedKey, majorSelectedKey, allClass[index].key)

    if (!schedule) {
      return
    }

    const customTitle = allClass[index].name !== "" ? `${allClass[index].name}` : "班级课表"

    global.cache.Set('recommendSchedule', schedule)
    Taro.navigateTo({url: '/pages/edu/schedule/schedule?from=recommend&title=' + customTitle})
  }

  async handleShowPanel () {
    const { showSearchPanel, isLogin } = this.state

    if (!showSearchPanel && !isLogin) {
      const isLogin = await this.login()
      if (!isLogin) {
        return
      }
    }

    !showSearchPanel && this.initSearchPanel()
    this.setState({showSearchPanel: !showSearchPanel})
  }

  async handleSaveSchedule (index, e) {
    e.stopPropagation()

    const { yearSemesterSelected, gradeSelectedKey, majorSelectedKey, allClass, yearSemesterText } = this.state
    const thisClass = allClass[index]
    const scheduleTitle = `${thisClass.name} ${yearSemesterText}`

    const res = await Taro.showModal({title: '提示', content: `确定要保存 ${scheduleTitle} 的课表吗？`})

    if (res.cancel) {
      return
    }

    const schedule = await this.getSchedule(yearSemesterSelected[0], yearSemesterSelected[1], gradeSelectedKey, majorSelectedKey, thisClass.key)

    if (!schedule) {
      Taro.showToast({title: '获取课表失败', icon: 'none'})
      return
    }

    const recommendSchedules: Array<any> = Taro.getStorageSync('recommendSchedules') || []
    const thisScheduleMap = {className: thisClass.name, yearSemester: yearSemesterText, schedule: schedule}

    for (let s of recommendSchedules) {
      if (s.yearSemester === yearSemesterText && s.className === thisClass.name) {
        Taro.showToast({title: '已经保存过该课表，保存失败', icon: 'none'})
        return
      }
    }

    recommendSchedules.push(thisScheduleMap)

    Taro.setStorageSync('recommendSchedules', recommendSchedules)
    Taro.showToast({title: '保存成功', icon: 'none'})
    this.loadRecommendSchedules()
  }

  handleHistoryClick (index1, index2, e) {
    e.stopPropagation()
    
    const { recommendSchedules } = this.state

    const thisSchedule = recommendSchedules[index1].schedules[index2]

    const customTitle = thisSchedule.className

    global.cache.Set('recommendSchedule', thisSchedule.schedule)
    Taro.navigateTo({url: '/pages/edu/schedule/schedule?from=recommend&title=' + customTitle})
  }

  handleHistoryManage (index1) {
    const { recommendSchedules } = this.state
    recommendSchedules[index1].showManageArea = !recommendSchedules[index1].showManageArea
    this.setState({recommendSchedules})
  }

  async handleDeleteSchedule (index1, index2, e) {
    e.stopPropagation()
    
    const { recommendSchedules } = this.state
    const scheduleListMap = recommendSchedules[index1]
    const thisSchedule = scheduleListMap.schedules[index2]
    const scheduleTitle = `${thisSchedule.className} ${scheduleListMap.key}`

    const res = await Taro.showModal({title: '提示', content: `确定要删除 ${scheduleTitle} 的课表吗？`})

    if (res.cancel) {
      return
    }

    const rs = Taro.getStorageSync('recommendSchedules')

    rs.splice(thisSchedule.index, 1)

    Taro.setStorageSync('recommendSchedules', rs)
    this.loadRecommendSchedules()
  }

  async login () {
    const response = await request.jwAuth({url: api.jwVerify, data: {tokenRequired: true}})

    if (!response  || response.data.code === -1) {
      return false
    }

    Taro.setStorageSync('eduToken', response.data.data.token)
    this.setState({isLogin: true})
    return true
  }

  async getMajor (college, grade) {
    const response = await request.jwRecommendMajor({college, grade})

    if (!response || response.data.code === -1) {
      return
    }

    const isValid = await this.checkLoginState(response)
    if (!isValid) {
      this.setState({collegeSelectedKey: '-1', collegeText: '请选择学院', collegeValue: ''})
      return
    }

    let range = this.transToRange(response.data.data.major, "majorCode", "majorName")

    if (range.length === 0) {
      range = [{key: '', name: ''}]
    }

    this.setState({majorRange: range, majorValue: 0, majorSelectedKey: range[0].key, majorText: range[0].name})
  }

  async getClass (college, grade, major) {
    const response = await request.jwRecommendClass({college, grade, major})

    if (!response || response.data.code === -1) {
      return
    }

    const isValid = this.checkLoginState(response)
    if (!isValid) {
      return
    }

    const range = this.transToRange(response.data.data.class, "classCode", "className")

    if (range.length === 0) {
      Taro.showToast({title: '查询到的数据条数为 0', icon: 'none'})
      return
    }

    this.setState({allClass: range})
  }

  async getSchedule (year, semester, grade, major, _class) {
    const response = await request.jwRecommendSchedule({year, semester, grade, major, _class})

    if (!response || response.data.code === -1) {
      return
    }

    if (!this.checkLoginState(response)) {
      return
    }

    if (response.data.data.schedule.length === 0) {
      Taro.showToast({title: '该课表数据为空', icon: 'none'})
      return
    }

    return response.data.data.schedule
  }

  render () {
    const { 
      yearSemesterRange, yearSemesterValue, yearSemesterText,
      collegeRange, collegeValue, collegeText,
      majorRange, majorValue, majorText,
      gradeRange, gradeValue, gradeText,
      allClass, recommendSchedules,
      openHelpFloatLayout, showSearchPanel
    } = this.state

    return (
      <View>
        {recommendSchedules.length === 0
        ? (
          <View className='none-text'>
            还未保存过班级课表哦，点击下方面板检索课表
          </View>
        )
        : null}
        <View className='card-list history'>
          {recommendSchedules.map((schedulesListMap, index1) => {
            return (
              <Panel title={schedulesListMap.key} key={index1} marginBottom={30} rightTip='管理' onRightTipClick={this.handleHistoryManage.bind(this, index1)}>
                {schedulesListMap.schedules.map((schedule, index2) => {
                  return (
                    <View className='card' key={index2} onClick={this.handleHistoryClick.bind(this, index1, index2)}>
                      <View className='left'>
                        <View className='class-name'>
                        {schedule.className}
                        </View>
                      </View>
                      {schedulesListMap.showManageArea
                      ? (
                        <View className='right'>
                          <Icon type='clear' size='20' color='red' onClick={this.handleDeleteSchedule.bind(this, index1, index2)}/>
                        </View>
                      )
                      : null
                    }
                    </View>
                  )
                })}
              </Panel>
            )
          })}
        </View>
        <View className={`searchPanel ${showSearchPanel ? 'show': ''}`}>
          <View className='searchPanel-header' onClick={this.handleShowPanel}><Text className='title'>检索</Text><Text className='arrow'>{showSearchPanel ? '∨': '∧'}</Text></View>
          <Form className='form' onSubmit={this.handleSubmit}>
            <View className='form-input'>
              <Label>年级</Label>
              <Picker mode='selector' range={gradeRange} rangeKey='name' value={gradeValue} onChange={this.handleGradeChange}>
                <View className='picker-text'>{gradeText}</View>
              </Picker>
            </View>
            <View className='form-input'>
              <Label>学院</Label>
              <Picker mode='selector' range={collegeRange} rangeKey='name' value={collegeValue} onChange={this.handleCollegeChange}>
                <View className='picker-text'>{collegeText}</View>
              </Picker>
            </View>
            <View className='form-input'>
              <Label>专业</Label>
              <Picker mode='selector' range={majorRange} rangeKey='name' value={majorValue} onChange={this.handleMajorChange}>
                <View className='picker-text'>{majorText}</View>
              </Picker>
            </View>
            <View className='form-input'>
              <Label>学期</Label>
              <Picker mode='multiSelector' range={yearSemesterRange} rangeKey='name' value={yearSemesterValue} onChange={this.handleYearSemesterChange}>
              <View className='picker-text'>{yearSemesterText}</View>
            </Picker>
            </View>
            <View className='tips' onClick={this.openHelp.bind(this, true)}><Image src={questionUrl}/></View>
            <Button className='btn' formType='submit'>确定</Button>
          </Form>
          <View className='card-list online'>
            {allClass.map((item, index) => {
              return (
                <View className='card' key={index} onClick={this.handleOnlineClick.bind(this, index)}>
                  <View className='left'>
                    <View className='cycle'>{index+1}</View>
                    <View className='class-name'>
                      {item.name}
                    </View>
                  </View>
                  <View className='right'><Text className='save' onClick={this.handleSaveSchedule.bind(this, index)}>保存</Text></View>
                </View>
              )
            })}
          </View>
        </View>
        <FloatLayout title='帮助' isOpened={openHelpFloatLayout} onClose={this.openHelp.bind(this, false)}>
          <Panel title='为什么需要登录' marginBottom={0}>
            <View className='help-text'>因为目前的技术原理是通过模拟请求来获取教务系统的推荐课表，所以需要登录教务系统。</View>
          </Panel>
          <Panel title='怎么添加指定的课程到我的课表里' marginBottom={0}>
            <View className='help-text'>在进入到指定的班级课表后，点击想要添加的课程按照提示操作即可添加到我的课表中。</View>
          </Panel>
          <Panel title='有个小技巧想要告诉你' marginBottom={0}>
            <View className='help-text'>当你点击确定出现班级后如果想要更改指定学年学期的课表时,直接修改即可,不需要再次点击确定检索课表。</View>
          </Panel>
          <Panel title='我现在选择的是什么' marginBottom={0}>
            <View className='help-text'>
              <View className='help-tip'>{collegeText}、{majorText || '未选择专业'}、{gradeText}、{yearSemesterText}</View>
            </View>
          </Panel>
        </FloatLayout>
      </View>
    )
  }
}