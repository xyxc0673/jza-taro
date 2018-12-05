import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'

import './about.scss'

import Panel from '../../../components/panel'

export default class About extends Component {
  config: Config = {
    navigationBarTitleText: '关于'
  }
  
  state = {
    
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCopyTextClick (text) {
    Taro.setClipboardData({data: text})
  }

  render () {
    return (
      <View>
        <View className='page'>
          <View className='logo'>
            <Image src={require('../../../asserts/images/robot.svg')}/>
          </View>
          <View className='intro'>
            <View className='intro-item'>[吉珠小助手]小程序为吉林大学珠海学院学生提供教务系统、校园卡、图书馆查询等服务。</View>
            <View className='intro-item'>如果你在使用的过程中遇到了问题或者有什么想法，欢迎通过关于页面的反馈选项告诉我。</View>
          </View>
          <Panel title='更新日志' marginBottom={0}>
            <View className='list'>
              <View className="list-item title">版本: 0.2.0 日期: 2018-12-05</View>
              <View className='list-item'>新增 图书馆个人中心</View>
              <View className='list-item'>新增 左右滑动我的课程表主体可切换上下周课程</View>
              <View className='list-item'>修复 一些学院拥有不同的学年制度所产生的问题</View>
              <View className='list-item'>修复 图书查询第一次加载更多时出现重复的记录</View>
              <View className='list-item'>修复 我的课程表表头日期中月份不正确的问题</View>
              <View className='list-item'>优化 部分样式、文案与代码结构</View>
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
        </View>

        <View className='footer'>
          <View>吉珠小助手 · Made With Time</View>
        </View>
      </View>
    )
  }
}