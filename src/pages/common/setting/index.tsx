import Taro, {Component, Config} from '@tarojs/taro'
import {View, Button, Text, OpenData, Icon} from '@tarojs/components'

import './index.scss'

import Panel from '../../../components/panel'

import Account from '../../../services/account'

import init from '../../../utils/init'
import global from '../../../utils/global';
import config from '../../../utils/config';

export default class Setting extends Component {
  config: Config = {
    navigationBarTitleText: '设置'
  }
  
  state = {
    account: Account.Get(),
    libAccount: Account.GetLib(),
    accountState: {jw: false, card: false, lib: false,},
    currentSize: 0,
  }

  componentWillMount () {
    const res = Taro.getStorageInfoSync()
    this.setState({currentSize: res.currentSize})
    this.loadBindState()
  }

  componentDidMount () {
    Taro.eventCenter.on('settingRemount', () => {
      this.loadBindState()
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    Taro.eventCenter.trigger('settingRemount')
  }

  componentDidHide () { }

  onShareAppMessage () {
    return {
      title: '明日何其多',
      path: '/pages/index/index',
      imageUrl: config.shareImageUrl
    }
  }

  loadBindState () {
    const state = {
      jw: Account.checkBindState('jw'),
      card: Account.checkBindState('card'),
      lib: Account.checkBindState('lib'),
    }
    this.setState({accountState: state})
  }

  async handleDataClear () {
    const resp = await Taro.showModal({title: '提示', content: '确定要清除所有数据吗？如需解绑账号，请点击账号栏相关条目解绑。', confirmColor: 'red'})
    if (resp.cancel) { return }

    Taro.clearStorageSync()
    global.cache.Clear()

    init()

    Taro.reLaunch({url: '/pages/index/index'})
    return
  }

  async handleClick (key) {
    const routes = {
      bind: '/pages/common/bind/index',
      libBind: '/pages/library/auth',
      ui: '/pages/common/setting/display',
      about: '/pages/common/setting/about',
    }

    Taro.navigateTo({url: routes[key]})
  }

  async handleClearClick (type) {
    if (this.state.accountState[type] === false) {
      if (type === 'lib') {
        this.handleClick('libBind')
        return
      }

      this.handleClick('bind')
      return
    }
    
    const _type = {
      jw: '教务',
      card: '校园卡',
      lib: '图书馆',
    }
    const typeHuman = `解绑${_type[type]}账号`
    const res = await Taro.showModal({title: '提示', content: `你确定要${typeHuman}吗？`})

    if (res.cancel) {
      return
    }

    if (type === "lib") {
      Account.SaveLib({})
      Taro.setStorageSync('opacToken', '')
    } else {
      let { account } = this.state

      account = Object.assign({}, account, {[`${type}Password`]: ''})

      Account.Save(account)
      this.setState({account: account})
    }

    Taro.showToast({title: `${typeHuman}成功`, icon: 'none'})
    this.loadBindState()
    Taro.eventCenter.trigger('indexRemount')
  }

  render () {
    const { account, libAccount, accountState, currentSize } = this.state

    return (
      <View className=''>
        <View className='user-info'>
          <OpenData className='avatar' type='userAvatarUrl' />
          <View className='nickname'>{account.studentID || libAccount ? account.studentID || libAccount.studentID : '未绑定'}</View>
        </View>
        <Panel title='设置' marginBottom={0}>
          <View className='list with-symbol'>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'bind')}>绑定<Text className='symbol'>></Text></View>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'ui')}>显示<Text className='symbol'>></Text></View>
          </View>
        </Panel>
        <Panel title='其他' marginBottom={0}>
          <View className='list with-symbol'>
            <Button className='list-item button' openType='contact' hoverStayTime={200} hoverClass='list-item__hover'>反馈<Text className='symbol'>></Text></Button>
            <Button className='list-item button' openType='share' hoverStayTime={200} hoverClass='list-item__hover'>分享<Text className='symbol'>></Text></Button>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'about')}>关于<Text className='symbol'>></Text></View>
          </View>
        </Panel>
        <Panel title='账号' marginBottom={0}>
          <View className='list with-symbol'>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClearClick.bind(this, 'jw')}>教务 <Text id='jw' className='symbol'>{accountState.jw == true ? '√': '×'}</Text></View>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClearClick.bind(this, 'card')}>校园卡 <Text id='card' className='symbol'>{accountState.card == true ? '√': '×'}</Text></View>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClearClick.bind(this, 'lib')}>图书馆 <Text id='lib' className='symbol'>{accountState.lib == true ? '√': '×'}</Text></View>
          </View>
        </Panel>
        <Panel title='数据' marginBottom={0}>
          <View className='list with-symbol'>
            <View className='list-item' hoverClass='list-item__hover' onClick={this.handleDataClear}>
            <View>
              清除数据<Text className='small grey'>(占用存储空间：{currentSize} kb)</Text>
            </View>
            <Icon type='info' color='red' size='18'></Icon>
            </View>
          </View>
        </Panel>
      </View>
    )
  }
}