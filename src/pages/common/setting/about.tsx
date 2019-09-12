import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image, Text} from '@tarojs/components'

import './about.scss'

import Panel from '../../../components/panel'

import data from '../../../utils/data'
import request from '../../../utils/request';

interface IState {
  qqGroup: string
}


export default class About extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: '关于'
  }
  
  state = {
    qqGroup: ''
  }

  componentWillMount () { }

  componentDidMount () {
    this.fetchQQGroup()
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCopyTextClick (text) {
    Taro.setClipboardData({data: text})
  }

  async fetchQQGroup() {
    const res = await request.qqGroup()
    if (!res.data.data.number) {
      return
    }
    this.setState({ qqGroup: res.data.data.number })
  }

  render () {
    const { qqGroup } = this.state

    return (
      <View>
        <View className='logo'>
          <Image src={require('../../../asserts/images/robot.svg')}/>
        </View>
        <View className='intro'>
          <View className='intro-item'>[吉珠小助手]小程序为吉林大学珠海学院学生提供教务系统、校园卡、图书馆查询等服务。</View>
          <View className='intro-item'>如果你在使用的过程中遇到了问题或者有什么想法，欢迎通过设置页面的反馈选项告诉我。</View>
        </View>
        <Panel title='更新日志' marginBottom={0}>
          <View className='list'>
            <View className="list-item title">版本: {data.version}</View>
            {data.changeLog.map((log, index) => {
              return (
                <View className='list-item' key={index}>{log}</View>
              )
            })}
          </View>
        </Panel>
        <Panel title='开源' marginBottom={0}>
          <View className='copy-text' onClick={this.handleCopyTextClick.bind(this, 'http://t.cn/ELtmhvK')}>http://t.cn/ELtmhvK</View>
        </Panel>
        <Panel title='感谢' marginBottom={0}>
          <View className='list'>
            <View className='list-item'>Taro</View>
            <View className='list-item'>Iconfont</View>
            <View className='list-item'>We川大</View>
            <View className='list-item'>微吉风</View>
            <View className='list-item'>课表</View>
          </View>
        </Panel>
        <Panel title='鸣谢' marginBottom={0}>
          <View className='list'>
            <View className='list-item'>@車前子：提供帮助以解决课表显示不正确的问题</View>
            <View className='list-item'>@史努比：提供帮助以开发借阅历史分页显示功能</View>
          </View>
        </Panel>
        {qqGroup && (
          <Panel title='交流' marginBottom={100}>
            <Text className='welcome-text'>欢迎加入交流 QQ 群：</Text>
            <View className='copy-text' onClick={this.handleCopyTextClick.bind(this, qqGroup)}>{qqGroup}</View>
          </Panel>
        )}
        <View className='footer'>
          <View>吉珠小助手 · Made With Time</View>
        </View>
      </View>
    )
  }
}