import Taro, {Component, Config} from '@tarojs/taro'
import {View, Form, Text, Button} from '@tarojs/components'

import './index.scss'

import GradePicker from '../../../components/grade-picker'
import Panel from '../../../components/panel';

import request from '../../../utils/request'
import FloatLayout from '../../../components/float-layout';

interface IScore {
  course_name: string,
  score: string,
  credit: string,
  point: string,
  course_type: string,
}

interface IState {
  showResult: boolean,
  year: number,
  semester: number,
  scores: Array<IScore>,

  totalScore: string,
  totalCreditPoint: string,
  averageScore: string,
  averageCreditPoint: string,
  calCount: number,

  openHelpFloatLayout: boolean,
}

export default class Score extends Component {
  config: Config = {
    navigationBarTitleText: '教务成绩'
  }
  
  state: IState = {
    showResult: false,
    year: 0,
    semester: 0,
    scores: [],

    totalScore: "",
    totalCreditPoint: "",
    averageScore: "",
    averageCreditPoint: "",
    calCount: 0,

    openHelpFloatLayout: false,
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  async handleSubmit () {
    const {year, semester} = this.state
    const response = await request.jwScores(year, semester)

    if (!response || !response.data) {
      return
    }

    if (response.data.data.scores.length === 0) {
      Taro.showToast({title: '查询到的数据条数为 0', icon: 'none'})
      return
    }

    const data = this.calScores(response.data.data.scores)
    const newState = Object.assign(data, {'scores': response.data.data.scores, showResult: true})

    this.setState(newState)
  }

  calScores (scores: Array<any>) {
    let totalScore: number = 0
    let totalCredit: number = 0
    let totalCreditPoint: number = 0
    let averageScore: number = 0
    let averageCreditPoint: number = 0

    scores.forEach((item) => {
      
      const creditFloat = parseFloat(item.credit)
      const creditPointFloat= creditFloat * parseFloat(item.point)

      totalCreditPoint += creditPointFloat
      totalCredit += creditFloat
      
      // 优秀、良好、中等、及格、不及格
      let scoreFloat
      switch (item.score) {
        case "优秀":
          scoreFloat = 90
          break
        case "良好":
          scoreFloat = 80
          break
        case "中等":
          scoreFloat = 70
          break 
        case "及格":
          scoreFloat = 60
          break     
        case "不及格":
          scoreFloat = 50
          break
        default:
          scoreFloat = parseFloat(item.score)
      }

      totalScore += creditFloat * scoreFloat
    })
    
    averageScore = totalScore / totalCredit
    averageCreditPoint = totalCreditPoint / totalCredit

    return {totalScore: totalScore.toFixed(2), totalCreditPoint: totalCreditPoint.toFixed(2), averageScore: averageScore.toFixed(2), averageCreditPoint: averageCreditPoint.toFixed(2)}
  }

  handleChange (k, v) {
    this.setState({[`${k}`]: v})
  }

  handleAnalysisHelp (value) {
    this.setState({openHelpFloatLayout: value})
  }

  render () {
    return (
      <View className='page'>
        <View>
          <Form className='form' onSubmit={this.handleSubmit}>
            <GradePicker onChange={this.handleChange} showTotal={true}></GradePicker>
            <Button className='btn' formType='submit'>检索</Button>
          </Form>
        </View>
        <View>
        {this.state.showResult
          ? (
              <View>
                <Panel title={`分析 - ${this.state.scores.length} 条记录`} marginBottom={0} padding="20rpx 10rpx" rightTip="帮助" onRightTipClick={this.handleAnalysisHelp.bind(this, true)}>
                  <View className="analysis">
                    <View className="column">
                      <Text>加权平均分：{this.state.averageScore}</Text>
                      <Text>平均学分绩点：{this.state.averageCreditPoint}</Text>
                    </View>
                    {/* <View className="column">
                      <Text>总成绩个数: {this.state.scores.length}</Text>
                      <Text>平均分成绩个数: {this.state.calCount}</Text>
                    </View> */}
                  </View>
                </Panel>
                {/* <LineText title={`本学期共查询到 ${this.state.scores.length} 条记录`}></LineText> */}
                <View>
                  {this.state.scores.map((item, index) => {
                    return (
                      <View className='card' key={index}>
                        <View className='column'>
                          <Text className='course-name'>{item.course_name}</Text>
                          <Text className='score'>{item.score}</Text>
                        </View>
                        <View className='column'>
                          <Text>{item.course_type} / {item.credit}</Text>
                          <Text>{item.point}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          : null
        }
        </View>
        <FloatLayout title="帮助" isOpened={this.state.openHelpFloatLayout} onClose={this.handleAnalysisHelp.bind(this, false)}>
          <View>
            <Panel title="说明" marginBottom={0}>
              <View className="help-text">
                所有计算均在微信小程序中进行。成绩为 优秀、良好、中等、及格、不及格 会被分别换算为 90、80、70、60、50（经过检验，与教务系统算法一致）。
              </View>
            </Panel>
            <Panel title="计算公式" marginBottom={0}>
              <View className="help-text">
              加权平均分：课程学分×课程得分 之和除于 课程学分之和。
              </View>
              <View className="help-text">
              平均学分绩点：课程学分×课程绩点 之和除于 课程学分之和。
              </View>    
            </Panel>
          </View>
        </FloatLayout>
      </View>
    )
  }
}