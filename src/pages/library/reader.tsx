import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, OpenData, Form, Input, Image, Button } from '@tarojs/components'

import './reader.scss'

import Panel from '../../components/panel';
import FloatLayout from '../../components/float-layout';

import utils from '../../utils/utils'
import Account from '../../services/account';
import Library from '../../services/library'

export default class Sample extends Component {
  config: Config = {
    navigationBarTitleText: '我的图书馆',
    enablePullDownRefresh: true,
    backgroundTextStyle: "dark",
  }
  
  state = {
    page: 0,
    totalCount: 0,
    nearExpire: '－',
    expired: '－',
    order: '－',
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
      this.setState({nearExpire: '0', expired: '0', order: '0', currentCheckout: [], checkoutRecord: []}, () => {
        this.init()
      })
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onPullDownRefresh () {
    this.init()
    Taro.stopPullDownRefresh()
  }

  init () {
    const opacToken = Taro.getStorageSync('opacToken')
    if (!opacToken) {
      utils.openNavModal('检测到你还未登录，是否前往登录？', '/pages/library/auth')
      return
    }

    const account = Account.GetLib()
    this.setState({loginState: account.studentID})

    this.getInfo()
    this.getCurrentCheckout()
    this.getCheckoutRecord(true)
  }

  goto (url) {
    Taro.navigateTo({url: url})
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
    const response = await Library.getCaptchaResponse(true)

    if (!response) {
      return
    }

    this.setState({captcha: '', captchaSource: 'data:image/jpeg;base64,' + response.data.data.captcha})
  }

  async getInfo () {
    const res = await Library.getInfo()

    if (!res) {
      return
    }

    if (!res.isLogin) {
      const { loginState } = this.state
      this.setState({loginState: loginState+'(登录已过期)', isLogin: false})
      return
    }

    this.setState(res)
  }

  async getCurrentCheckout() {
    const record = await Library.getCurrentCheckout()

    if (!record) {
      return
    }

    this.setState({currentCheckout: record})
  }

  async getCheckoutRecord(firstSearch) {
    const { page, checkoutRecord } = this.state
    const nextPage = firstSearch ? 1 : page + 1
    
    const response = await Library.getCheckoutRecord(nextPage)

    if (!response) {
      return
    }

    const { record, totalCount } = response

    if (!record) {
      return
    }

    if (nextPage > 1 && record.length === 0) {
      Taro.showToast({title: '没有更多记录了', icon: 'none'})
      return
    }

    const newRecordArray = firstSearch ? record: checkoutRecord.concat(record)

    this.setState({page: nextPage, checkoutRecord: newRecordArray, totalCount: totalCount})
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

    const check = await Library.getRenewCheck(renewBarcode)

    if (!check) {
      return
    }

    const response = await Library.renewBook(captcha, renewBarcode, check)

    if (!response) {
      this.getCaptcha()
      return
    }

    this.getInfo()
    this.getCurrentCheckout()

    Taro.showToast({title: '续借成功', icon: 'none'})
  }

  render () {
    const { totalCount, nearExpire, expired, loginState, isLogin, currentCheckout, checkoutRecord, captcha, captchaSource, openRenewFloatLayout } = this.state

    return (
      <View className='full-bd background-grey'>
        <View className='info' onClick={this.goto.bind(this, '/pages/library/auth')}>
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
            <View className='item__value'>{isLogin ? totalCount + currentCheckout.length : '－'}</View>
            <View className='item__title'>总共借阅</View>
          </View>
          <View className='item'>
            <View className='item__value'>{isLogin ? currentCheckout.length : '－'}</View>
            <View className='item__title'>当前借阅</View>
          </View>
          <View className='item'>
            <View className='item__value'>{nearExpire}</View>
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
                    <View className='item'><Text className='key'>书籍</Text><Text className='value'>{item.title}</Text></View>
                    <View className='item'><Text className='key'>作者</Text><Text className='value'>{item.author}</Text></View>
                    <View className='item'><Text className='key'>条形码</Text><Text className='value'>{item.barcode}</Text></View>
                    <View className='item'><Text className='key'>馆藏地</Text><Text className='value'>{item.location}</Text></View>
                    <View className='item'><Text className='key'>借出日期</Text><Text className='value'>{item.lendDate}</Text></View>
                    <View className='item'><Text className='key'>应还日期</Text><Text className='value'>{item.returnDate}</Text></View>
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
                    <View className='item'><Text className='key'>书籍</Text><Text className='value'>{item.title}</Text></View>
                    <View className='item'><Text className='key'>作者</Text><Text className='value'>{item.author}</Text></View>
                    <View className='item'><Text className='key'>条形码</Text><Text className='value'>{item.barcode}</Text></View>
                    <View className='item'><Text className='key'>借出日期</Text><Text className='value'>{item.lendDate}</Text></View>
                    <View className='item'><Text className='key'>归还日期</Text><Text className='value'>{item.returnDate}</Text></View>
                  </View>
                )
              })}
            </View>
          </View>
          <View className='load-more' onClick={this.getCheckoutRecord.bind(this, false)}>加载更多</View>
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