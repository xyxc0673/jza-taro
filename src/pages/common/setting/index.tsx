import Taro, {Component, Config} from '@tarojs/taro'
import {View, Button, Text, OpenData} from '@tarojs/components'

import './index.scss'

import Panel from '../../../components/panel'

import Account from '../../../services/edu/account'

import init from '../../../utils/init'

export default class Setting extends Component {
  config: Config = {
    navigationBarTitleText: '设置'
  }
  
  state = {
    account: Account.get(),
    accountState: {jw: false, card: false},
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

  componentDidShow () { }

  componentDidHide () { }

  loadBindState () {
    const state = {
      jw: Account.checkBindState('jw'),
      card: Account.checkBindState('card'),
    }
    this.setState({accountState: state})
  }

  async handleClick (key) {
    if (key === 'clear') {
      const resp = await Taro.showModal({title: '提示', content: '确定要清除所有数据吗？'})
      if (resp.cancel) { return }
      Taro.clearStorageSync()

      init()
      Account.reCache()

      Taro.reLaunch({url: '/pages/index/index'})
      return
    }

    const routes = {
      bind: '/pages/common/bind/index',
      ui: '/pages/common/setting/display',
      about: '/pages/common/setting/about',
    }
    Taro.navigateTo({url: routes[key]})
  }

  async handleClearClick (type) {
    if (this.state.accountState[type] === false) {
      this.handleClick('bind')
      return
    }
    
    const _type = {
      jw: '教务',
      card: '校园卡'
    }
    const typeHuman = `解绑${_type[type]}账号`
    const res = await Taro.showModal({title: '提示', content: `你确定要${typeHuman}吗？`})

    let { account } = this.state

    if (res.cancel) {
      return
    }

    account = Object.assign({}, account, {[`${type}Password`]: ''})

    Taro.setStorageSync('account', account)

    Account.reCache()

    Taro.showToast({title: `${typeHuman}成功`, icon: 'none'})
    this.loadBindState()
    Taro.eventCenter.trigger('indexRemount')
  }

  render () {
    const { account, accountState, currentSize } = this.state

    return (
      <View className=''>
        <View className='user-info'>
          <OpenData className='avatar' type='userAvatarUrl' />
          <View className='nickname'>{account.studentID ? account.studentID: '未绑定'}</View>
        </View>
        <Panel title='设置' marginBottom={0}>
          <View className='list with-symbol'>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'bind')}>绑定<Text className='symbol'>></Text></View>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'ui')}>显示<Text className='symbol'>></Text></View>
            <Button className='list-item button' openType='contact' hoverStayTime={200} hoverClass='list-item__hover'>反馈<Text className='symbol'>></Text></Button>
            <View className='list-item' hoverStayTime={200} hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'about')}>关于<Text className='symbol'>></Text></View>
          </View>
        </Panel>
        <Panel title='账号' marginBottom={0}>
          <View className='list'>
            <View className='list-item'>教务 <Text id='jw' className='state' onClick={this.handleClearClick.bind(this, 'jw')}>{accountState.jw == true ? '已': '未'}绑定</Text></View>
            <View className='list-item'>校园卡 <Text id='card' className='state' onClick={this.handleClearClick.bind(this, 'card')}>{accountState.card == true ? '已': '未'}绑定</Text></View>
          </View>
        </Panel>
        <Panel title='缓存' marginBottom={0}>
          <View className='list with-symbol'>
            <View className='list-item' hoverClass='list-item__hover' onClick={this.handleClick.bind(this, 'clear')}>
            <View>
              清除数据<Text className='small grey'>(占用储存空间：{currentSize} kb)</Text>
            </View>
            <Text className='danger-cycle'>!</Text>
            </View>
          </View>
        </Panel>
      </View>
    )
  }
}