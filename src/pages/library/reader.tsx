import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, OpenData, Form, Input, Image, Button } from '@tarojs/components'

import './reader.scss'

import Panel from '../../components/panel';
import FloatLayout from '../../components/float-layout';

import request from '../../utils/request'
import utils from '../../utils/utils'
import Account from '../../services/edu/account';

export default class Sample extends Component {
  config: Config = {
    navigationBarTitleText: '我的图书馆'
  }
  
  state = {
    nearExpired: '0',
    expired: '0',
    order: '0',
    loginState: '未登录',
    isLogin: false,
    currentCheckout: [] as Array<any>,
    checkoutRecord: [] as Array<any>,

    renewBarcode: '',
    captcha: '',
    captchaSource: '',
    openRenewFloatLayout: false,
  }

  componentWillMount () {
    this.init()
  }

  componentDidMount () {
    Taro.eventCenter.on('libraryReaderRemount', () => {
      this.setState({nearExpired: '0', expired: '0', order: '0', currentCheckout: [], checkoutRecord: []}, () => {
        this.init()
      })
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  init () {
    const opacToken = Taro.getStorageSync('opacToken')
    if (!opacToken) {
      utils.openNavModal('检测到你还未登录，是否前往登录？', '/pages/library/auth')
      return
    }

    const account = Account.GetLib()
    this.setState({loginState: account.studentID, isLogin: true})

    this.getInfo()
    this.getCurrentCheckout()
    this.getCheckoutRecord()
  }

  gotoAuth () {
    Taro.navigateTo({url: '/pages/library/auth'})
  }

  openRenewFloatLayout (value: boolean, barcode? : string) {
    if (value) {
      this.getCaptcha()
    }
    
    this.setState({openRenewFloatLayout: value, renewBarcode: barcode})
  }

  handleInput (e) {
    this.setState({ [e.currentTarget.id]: e.detail.value })
  }

  showRenewHelp () {
    Taro.showModal({title: '提示', content: '点击当前订阅中想要续借的书籍按提示就可以续借啦。不过按照图书馆的规则，只能在到期前 10 天续借，而且只能续借一次哦。', showCancel: false})
  }

  async getCaptcha () {
    const opacToken = Taro.getStorageSync('opacToken')

    const response = await request.libReaderCaptcha({opacToken: opacToken})

    if (!response) {
      return
    }

    this.setState({captcha: '', captchaSource: 'data:image/jpeg;base64,' + response.data.data.captcha})
  }

  isValid (response) {
    if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
      return false
    }
    return true
  }

  async getInfo () {
    const response = await request.libReaderInfo({quite_mode: true})

    if (!response) {
      return
    }

    if (!this.isValid(response)) {
      const { loginState } = this.state
      this.setState({loginState: loginState+'(登录已过期)', isLogin: false})
      return
    }

    const { nearExpired, expired, order } = response.data.data

    this.setState({nearExpired: nearExpired, expired: expired, order: order})
  }

  async getCurrentCheckout() {
    const response = await request.libReaderCurrentCheckout({quite_mode: false})

    if (!response || !this.isValid(response)) {
      return
    }

    this.setState({currentCheckout: response.data.data.record})
  }

  async getCheckoutRecord() {
    const response = await request.libReaderCheckoutRecord({quite_mode: false})

    if (!response || !this.isValid(response)) {
      return
    }

    this.setState({checkoutRecord: response.data.data.record})
  }

  async getRenewCheck (barcode) {
    const response = await request.libReaderRenewCheck({barcode: barcode, quite_mode: false})

    if (!response) {
      return
    }

    if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
      Taro.showModal({title: '提示', content: '登录已过期，请重新登录', showCancel: false})
      return
    }
    
    return response.data.data.check
  }

  async RenewBook (captcha, barcode, check) {
    const response = await request.libReaderRenew({captcha: captcha, barcode: barcode, check: check})

    if (!response || response.data.code == -1) {
      return
    }

    if (response.data.data === "缓存不存在或已过期" || response.data.data === "未登录") {
      Taro.showModal({title: '提示', content: '登录已过期，请重新登录', showCancel: false})
      return
    }

    return response
  }

  async handleSubmit () {
    const { captcha, renewBarcode } = this.state

    const captchaValidation = (captcha): Boolean => {
      return captcha.length == 4
    }

    if (!captchaValidation(captcha)) {
      Taro.showToast({title: '请检查验证码', icon: 'none'})
      return
    }

    const check = await this.getRenewCheck(renewBarcode)

    if (!check) {
      return
    }

    const response = await this.RenewBook(captcha, renewBarcode, check)

    if (!response) {
      this.getCaptcha()
      return
    }

    this.getInfo()
    this.getCurrentCheckout()

    Taro.showToast({title: '续借成功', icon: 'none'})
  }

  render () {
    const { nearExpired, expired, loginState, isLogin, currentCheckout, checkoutRecord, captcha, captchaSource, openRenewFloatLayout } = this.state

    return (
      <View className='full-bd background-grey'>
        <View className='info' onClick={this.gotoAuth}>
          <View className='left'>
            <OpenData className='avatar' type='userAvatarUrl'></OpenData>
            <View className='detail'>
              <OpenData type='userNickName'></OpenData>
              <View className='login-state'>{loginState}</View>
            </View>
          </View>
          <View className='right'>
            <Text className='arrow'>></Text>
          </View>
        </View>
        <View className='float-card'>
          <View className='item'>
            <View className='item__value'>{currentCheckout.length + checkoutRecord.length}</View>
            <View className='item__title'>总共借阅</View>
          </View>
          <View className='item'>
            <View className='item__value'>{currentCheckout.length}</View>
            <View className='item__title'>当前借阅</View>
          </View>
          <View className='item'>
            <View className='item__value'>{nearExpired}</View>
            <View className='item__title'>即将过期</View>
          </View>
          <View className='item'>
            <View className='item__value'>{expired}</View>
            <View className='item__title'>已经过期</View>
          </View>
        </View>
        <Panel title='当前借阅' none={currentCheckout.length === 0} nonText={`${!isLogin ? '还未登录': '无记录'}`} rightTip='续借' onRightTipClick={this.showRenewHelp}>
          <View className='table'>
            <View className="table-body">
              {currentCheckout.map((item, index) => {
                return (
                  <View className='card' key={index} onClick={this.openRenewFloatLayout.bind(this, true, item.barcode)}>
                    <View className='item'><Text>书籍</Text><Text>{item.title}</Text></View>
                    <View className='item'><Text>作者</Text><Text>{item.author}</Text></View>
                    <View className='item'><Text>条形码</Text><Text>{item.barcode}</Text></View>
                    <View className='item'><Text>馆藏地</Text><Text>{item.location}</Text></View>
                    <View className='item'><Text>借出日期</Text><Text>{item.lendDate}</Text></View>
                    <View className='item'><Text>应还日期</Text><Text>{item.returnDate}</Text></View>
                  </View>
                )
              })}
            </View>
          </View>
        </Panel>
        <Panel title='借阅历史' none={checkoutRecord.length === 0} nonText={`${!isLogin ? '还未登录': '无记录'}`}>
          <View className='table'>
            <View className="table-body">
              {checkoutRecord.map((item, index) => {
                return (
                  <View className='card' key={index}>
                    <View className='item'><Text>书籍</Text><Text>{item.title}</Text></View>
                    <View className='item'><Text>作者</Text><Text>{item.author}</Text></View>
                    <View className='item'><Text>条形码</Text><Text>{item.barcode}</Text></View>
                    <View className='item'><Text>借出日期</Text><Text>{item.lendDate}</Text></View>
                    <View className='item'><Text>归还日期</Text><Text>{item.returnDate}</Text></View>
                  </View>
                )
              })}
            </View>
          </View>
        </Panel>
        {/* this.openRenewFloatLayout.bind(this, false) 可以 this.handleRenewFloatLayout.bind(this, false) 却不可以*/}
        <FloatLayout isOpened={openRenewFloatLayout} onClose={this.openRenewFloatLayout.bind(this, false)}>
          <View className='fl-container'>
            <Form className='form' onSubmit={this.handleSubmit}>
              <View className="form-input captcha-input">
                <View className='form-input__left'>
                  <Input id='captcha' value={captcha} onInput={this.handleInput} placeholder='验证码'></Input>
                </View>
                <Image className='captcha' src={captchaSource} onClick={this.getCaptcha}></Image>
              </View>
              <Button className='btn' formType='submit'>续借</Button>
            </Form>
          </View>
        </FloatLayout>
      </View>
    )
  }
}