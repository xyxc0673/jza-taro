import Taro, {Component, Config} from '@tarojs/taro'
import {View, Form, Button} from '@tarojs/components'

import './setting.scss'

import GradePicker from '../../../components/grade-picker'

import utils from '../../../utils/utils'
import global from '../../../utils/global'
import request from '../../../utils/request'
import Account from '../../../services/account'

interface IState {
  year: number,
  semester: number,
}

export default class ScheduleSearch extends Component {
  config: Config = {
    navigationBarTitleText: '设置课程表'
  }
  
  state: IState = {
    year: 0,
    semester: 0,
  }

  componentWillMount () {
    const { year, semester } = Account.calYearSemester()
    this.setState({ year, semester })
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    if (global.cache.Get('from') === 'bind') {
      this.componentWillMount()
      global.cache.Set('from', '')
    }
  }

  componentDidHide () { }

  async handleSubmit () {
    const {year, semester} = this.state
    const response = await request.jwSchedule({year: year, semester: semester})
    
    if (!response || !response.data) {
      return
    }

    if (response.data.data.schedule.length === 0) {
      Taro.showToast({title: '该学期的课表没有课程', icon: 'none'})
    }

    utils.setStorage({'schedule': response.data.data.schedule})
    Taro.eventCenter.trigger('indexRemount')
    Taro.navigateTo({url: '/pages/edu/schedule/schedule'})
  }

  handleChange (k, v) {
    this.setState({[`${k}`]: v})
  }

  gotoCustom () {
    Taro.navigateTo({url: '/pages/edu/schedule/custom?from=search'})
  }

  render () {
    const { year, semester } = this.state
    return (
      <View className='page'>
        <View>
          <Form className='form' onSubmit={this.handleSubmit}>
            <GradePicker onChange={this.handleChange} schoolYears={Account.calSchoolYears()} year={year} semester={semester} />
            <Button className='btn' formType='submit'>检索</Button>
            <Button className='btn' onClick={this.gotoCustom}>管理自定义课表</Button>
          </Form>
        </View>
      </View>
    )
  }
}