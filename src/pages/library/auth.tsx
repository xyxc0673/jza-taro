import Taro, { Component, Config } from '@tarojs/taro'
import { View, Form, Label, Input, Image, Button } from '@tarojs/components'

import './auth.scss'

import FloatLayout from '../../components/float-layout';
import Panel from '../../components/panel';

import Account from '../../services/edu/account'
import request from '../../utils/request'
import utils from '../../utils/utils'

const questionUrl = require('../../asserts/images/question.svg')

export default class Sample extends Component {
  config: Config = {
    navigationBarTitleText: '图书馆 OPAC 登录'
  }
  
  state = {
    studentID: '',
    password: '',
    captcha: '',

    opacToken: '',
    captchaSource: '',

    openHelpFloatLayout: false,
  }

  componentWillMount () {
    const account = Account.GetLib()

    this.getCaptcha()

    if (!account || !account.studentID) {
      return
    }

    this.setState({studentID: account.studentID, password: account.password})
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleOpenHelp (value) {
    this.setState({openHelpFloatLayout: value})
  }

  handleInput (e) {
    this.setState({ [e.currentTarget.id]: e.detail.value })
  }

  async getCaptcha () {
    const response = await request.libReaderCaptcha({opacToken: ''})

    if (!response) {
      return
    }

    this.setState({captcha: '', opacToken: response.data.data.token, captchaSource: 'data:image/jpeg;base64,' + response.data.data.captcha})
  }

  async handleSummit () {
    const { studentID, password, captcha, opacToken } = this.state

    const studentIDValidation = (studentID): Boolean => {
      return studentID.length == 8
    }

    const passwordValidation = (password): Boolean => {
      return password.length > 5
    }

    const captchaValidation = (captcha): Boolean => {
      return captcha.length == 4
    }

    if (!studentIDValidation(studentID) || !passwordValidation(password)) {
      Taro.showToast({title: '请检查账号或密码', icon: 'none'})
      return
    }

    if (!captchaValidation(captcha)) {
      Taro.showToast({title: '请检查验证码', icon: 'none'})
      return
    }

    const response = await request.libReaderLogin({studentID, password, captcha, opacToken})

    if (!response || response.data.code === -1) {
      this.getCaptcha()
      return
    }

    let account = Account.GetLib()

    if (!account || account.studentID != studentID || account.password != password) {
      account = {
        studentID: studentID,
        password: password,
      }
    }

    Account.SaveLib(account)

    Taro.setStorageSync('opacToken', opacToken)
    Taro.eventCenter.trigger('libraryReaderRemount')
    Taro.navigateBack()
    Taro.showToast({title: '登录成功', icon: 'none'}) // Todo 这里会触发微信 `请注意 showLoading 与 hideLoading 必须配对使用` 的提示
  }

  render () {
    const { studentID, password, captcha, captchaSource, openHelpFloatLayout } = this.state
    
    return (
      <View className='page'>
        <Form className="form" onSubmit={this.handleSummit}>
          <View className="form-input">
            <Label>学号</Label>
            <Input id='studentID' type='number' value={studentID} onInput={this.handleInput}></Input>
          </View>
          <View className="form-input">
            <Label>密码</Label>
            <Input id='password' type='number' password={true} value={password} onInput={this.handleInput}></Input>
          </View>
          <View className="form-input captcha-input">
            <View className='form-input__left'>
              <Label>验证码</Label>
              <Input id='captcha' value={captcha} onInput={this.handleInput}></Input>
            </View>
            <Image className='captcha' src={captchaSource} onClick={this.getCaptcha}></Image>
          </View>
          <View className='tips' onClick={this.handleOpenHelp.bind(this, true)}><Image src={questionUrl}/></View>
          <Button className='btn' formType='submit'>确定</Button>
        </Form>
        <FloatLayout title='帮助' isOpened={openHelpFloatLayout} onClose={this.handleOpenHelp.bind(this, false)}>
          <Panel title='提示' marginBottom={0}>
            <View className='help-text'>如未修改过密码，默认密码一般为 12345678。</View>
          </Panel>
          <Panel title='有效期' marginBottom={0}>
            <View className='help-text'>登录成功后，登录状态的有效期为一个小时。此间任何有关图书馆个人中心的操作都会延长该有效期。</View>
          </Panel>
          <Panel title='隐私' marginBottom={0}>
            <View className='help-text'>账号密码均储存在微信内部中，但是基于技术实现，服务器会缓存一段时间登录成功后的会话，用于后续操作。</View>
          </Panel>
        </FloatLayout>
      </View>
    )
  }
}