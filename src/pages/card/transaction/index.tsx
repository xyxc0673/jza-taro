import Taro, { Component, Config } from '@tarojs/taro'
import { View, Picker, Input, Form, Label, Button } from '@tarojs/components'

import './index.scss'

import LineText from '../../../components/line-text'

import request from '../../../utils/request'
import utils from '../../../utils/utils'

interface ITransaction {
  time?: string,
  area?: string,
  trade_branch_name?: string,
  client_no?: string,
  operate_type?: string,
  amount?: string,
}

interface IState {
  startDate: string,
  endDate: string,
  total: number,

  transactions: ITransaction[],
  showResult: boolean,
}

export default class Transcation extends Component<IState> {
  config: Config = {
    navigationBarTitleText: '消费记录'
  }

  state: IState = {
    startDate: utils.formatTime(utils.deltaDate(-7)),
    endDate: utils.formatTime(new Date()),
    total: 0,
    transactions: [],
    showResult: false,
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  startDateSmallerThanEndDate (id, value) : boolean {
    let startDate, endDate
    if (id === 'startDate') {
      startDate = new Date(value)
      endDate = new Date(this.state.endDate)
    } else {
      startDate = new Date(this.state.startDate)
      endDate = new Date(value)
    }
    return (startDate <= endDate)
  }

  calConsume (transactions: ITransaction[]) : number {
    let total: number = 0
    if (!transactions) {
      return 0
    }
    transactions.map((item) => {
      let amount = parseFloat(item.amount as string)
      if (amount < 0) {
        total += amount
      }
    })
    return Math.abs(total)
  }

  handleChange (e) {
    if (!this.startDateSmallerThanEndDate(e.currentTarget.id, e.detail.value)) {
      Taro.showToast({title: '开始时间不能大于结束时间', icon: 'none'})
      return
    }
    this.setState({[`${e.currentTarget.id}`]: e.detail.value})
  }

  async handleSubmit () {
    const response = await request.cardTransaction({startDate: this.state.startDate, endDate: this.state.endDate})

    if (!response) {
      return
    }

    if (!response.data.data.transactions) {
      Taro.showToast({title: '无相关消费记录', icon: 'none'})
      return
    }
    
    this.setState({
      transactions: response.data.data.transactions,
      total: this.calConsume(response.data.data.transactions),
      showResult: true,
    })
  }

  render () {
    return (
      <View className='page'>
        <Form className='form' onSubmit={this.handleSubmit}>
          <View className='form-input'>
            <Label>起始日</Label>
            <Picker id='startDate' value={this.state.startDate} mode='date' onChange={this.handleChange}>
              <Input value={this.state.startDate} disabled/>
            </Picker>
          </View>
          <View className='form-input'>
            <Label>结束日</Label>
            <Picker id='endDate' value={this.state.endDate} mode='date' onChange={this.handleChange}>
              <Input value={this.state.endDate} disabled/>
            </Picker>
          </View>
          <Button className='btn' formType='submit'>查询</Button>
        </Form>
        <View>
          {this.state.showResult
            ? 
              <View className='resultPanel'>
                <LineText title={`${this.state.transactions.length} 条记录，共消费 ${this.state.total.toFixed(2)} 元`}></LineText>
                {
                  this.state.transactions && this.state.transactions.map((item, index) => {
                    return (
                      <View className='card' key={index}>
                        <View className='column'>
                          <View className='t-branch'>{item.trade_branch_name}</View>
                          <View className='t-amount'>{item.amount}</View>
                        </View>
                        <View className='column'>
                          <View className='t-area'>{item.area} / {item.client_no}</View>
                          <View className='t-time'>{item.time}</View>
                        </View>
                      </View>
                    )
                  })
                }
              </View>
            : null
          }
          
        </View>
      </View>
    )
  }
}