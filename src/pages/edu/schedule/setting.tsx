import Taro, {Component, Config} from '@tarojs/taro'
import {View, Form, Button} from '@tarojs/components'

import './setting.scss'

import GradePicker from '../../../components/grade-picker'

import request from '../../../utils/request'
import utils from '../../../utils/utils'


interface IState {
  year: string,
  semester: string,
}

export default class ScheduleSearch extends Component {
  config: Config = {
    navigationBarTitleText: '设置课程表'
  }
  
  state: IState = {
    year: '',
    semester: '',
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

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
    Taro.redirectTo({url: '/pages/edu/schedule/schedule'})
  }

  handleChange (k, v) {
    this.setState({[`${k}`]: v})
  }

  gotoCustom () {
    Taro.navigateTo({url: '/pages/edu/schedule/custom?from=search'})
  }

  render () {
    return (
      <View className='page'>
        <View>
          <Form className='form' onSubmit={this.handleSubmit}>
            <GradePicker onChange={this.handleChange}></GradePicker>
            <Button className='btn' formType='submit'>检索</Button>
            <Button className='btn' onClick={this.gotoCustom}>管理自定义课表</Button>
          </Form>
        </View>
      </View>
    )
  }
}