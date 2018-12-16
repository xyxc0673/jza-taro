import Taro, { Component, Config } from '@tarojs/taro'
import { View, Label, Input, Button, Form, Image } from '@tarojs/components'
import './index.scss'

import IAccount from '../../../interfaces/account'
import request from '../../../utils/request'
import utils from '../../../utils/utils'
import global from '../../../utils/global'
import Account from '../../../services/account';
import Schedule from '../../../services/schedule';

import FloatLayout from '../../../components/float-layout'
import Panel from '../../../components/panel'

const questionUrl = require('../../../asserts/images/question.svg')

interface IState {
    account: IAccount,
    openHelpFloatLayout: boolean,
}

export default class Index extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: '绑定'
  }

  state: IState = {
    account: Account.Get() as IAccount,
    openHelpFloatLayout: false,
  }

  componentWillMount () {
  }

  componentDidMount () {
  }

  componentDidShow () {

  }

  componentDidHide () {

  }

  onInput(e) {
    this.setState( previewState => ({
      account: Object.assign({}, previewState.account, {
        [e.currentTarget.id]: e.detail.value
      })
    }))
  }

  handleAnalysisHelp (value) {
    this.setState({openHelpFloatLayout: value})
  }

  checkVerified () {
    let verified: Array<string> = Taro.getStorageSync('verified')
    let {account} = this.state
    if (!account.studentID) {
      return verified
    } else if (account.jwPassword != '') {
      verified.push('jw')
    } else if (account.cardPassword != '') {
      verified.push('card')
    }
    return verified
  }

  async onSubmit() {
    const {studentID = '', jwPassword = '', cardPassword = ''} = this.state.account
    const acc = Account.Get()

    const changedValidation = (): Boolean => {
      return acc.studentID !== studentID
    }

    const studentIDValidation = (studentID): Boolean => {
      return utils.isObj(studentID) && studentID.length == 8
    }

    const jwPasswordValidation = (password): Boolean => {
      return utils.isObj(password) && password.length > 5
    }

    const cardPasswordValidation = (password): Boolean => {
      return utils.isObj(password) && password.length > 5
    }

    if (!studentIDValidation(studentID)) {
      return utils._showModal({content: 'Student ID shoule be 8 numbers'})
    }

    const passwordCheck = jwPasswordValidation(jwPassword) || cardPasswordValidation(cardPassword)

    if (!passwordCheck) {
      return utils._showModal({content: 'Please check password'})
    }

    let params = {
      studentID: studentID,
      password: jwPassword
    }

    let verifiedTime = 0

    console.log('==== Start JW Verify =====')

    let jwVerified = Account.checkBindState('jw')

    if (jwPassword !== '' && (!jwVerified || changedValidation())) {
      let response = await request.jwVerify(params)
      if (!utils.isObj(response) || response.data.code === -1) {
        return
      }
      verifiedTime ++
      jwVerified = true

    } else {
      jwVerified = false // 含义不同，这里表示这次没有认证过教务系统
    }

    console.log('==== Start Card Verify =====')

    let cardVerified = Account.checkBindState('card')
    params = Object.assign(params, {password: cardPassword})

    if (cardPassword !== '' && (!cardVerified || changedValidation())) {
      let response = await request.cardVerify(params)

      if (!utils.isObj(response) || response.data.code === -1) {
        return
      }
      verifiedTime ++
      cardVerified = true
    } else {
      cardVerified = false
    }

    const _account = {
      studentID: studentID,
      jwPassword: jwVerified ? jwPassword : acc.jwPassword,
      cardPassword: cardVerified ? cardPassword: acc.cardPassword,
    }

    if (verifiedTime == 0) {
      Taro.showToast({title: '没有修改过密码', icon: 'none'})
      return
    }

    utils.setStorage({account: _account})
    Account.Save(_account)

    if (jwVerified) {
      const res = await Taro.showModal({title: '提示', content: '认证成功，是否要同步获取本学期课表？'})
      if (res.confirm) {
        const ret = await Schedule.Get()
        if (!ret) {
          Taro.showModal({title: '提示', content: '获取失败，麻烦亲自去课表设置页面获取', showCancel: false})
        }
        Taro.eventCenter.trigger('scheduleCoreRemount')    
      }
    } else {
      Taro.showToast({title: '认证成功', icon: 'none'})
    }

    Taro.eventCenter.trigger('indexRemount')
    Taro.eventCenter.trigger('settingRemount')

    if (this.$router.params.from === 'requestAuth') {
      global.cache.Set('from', 'bind')
      Taro.navigateBack()
      return
    }

    Taro.navigateTo({url: '/pages/index/index'})
  }

  render () {
    return (
      <View className='page'>
        <View className='logo'></View>
        <Form className='form' onSubmit={this.onSubmit}>
          <View className='form-input'>
            <Label>学号</Label>
            <Input id='studentID' type='number' value={this.state.account.studentID} onInput={this.onInput} placeholder='请输入学号' placeholderClass='form-input__placeholder'></Input>
          </View>
          <View className='form-input'>
            <Label>教务密码</Label>
            <Input id='jwPassword' password={true} value={this.state.account.jwPassword} onInput={this.onInput} placeholder='请输入教务密码' placeholderClass='form-input__placeholder'></Input>
          </View>
          <View className='form-input'>
            <Label>校园卡密码</Label>
            <Input id='cardPassword' password={true} type='number' value={this.state.account.cardPassword} onInput={this.onInput} placeholder='请输入校园卡密码'  placeholderClass='form-input__placeholder'></Input>
          </View>
          <View className='tips' onClick={this.handleAnalysisHelp.bind(this, true)}><Image src={questionUrl}/></View>
          <Button className='btn' formType='submit'>确定</Button>
        </Form>
        <FloatLayout title="帮助" isOpened={this.state.openHelpFloatLayout} onClose={this.handleAnalysisHelp.bind(this, false)}>
          <View>
            <Panel title="说明" marginBottom={0}>
              <View className="help-text">
                绑定账号后，修改原有信息提交即可重新绑定。
              </View>  
            </Panel>
            <Panel title="隐私" marginBottom={0}>
              <View className="help-text">
                所有账号密码均保存在微信小程序内部储存中，服务器只作中转作用。
              </View>
            </Panel>
          </View>
        </FloatLayout>
      </View>
    )
  }
}