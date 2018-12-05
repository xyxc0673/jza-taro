import Taro, {Component} from '@tarojs/taro'
import {View, Label, Input, Picker} from '@tarojs/components'

import './index.scss'

import Account from '../../services/edu/account'

interface IProps {
  onChange: Function,
  showTotal?: boolean
}

interface IState {
  yearRange: Array<any>,
  semesterRange: Array<any>,
  yearSelected: number,
  semesterSelected: number,
}

export default class GradePicker extends Component<IProps, {}> {
  static defaultProps = {
    showTotal: false,
  }


  constructor (props) {
    super (...arguments)
    const {showTotal} = props

    if (showTotal) {
      const {yearRange, semesterRange} = this.state
      yearRange.unshift({key: '', name: '全部'})
      semesterRange.unshift({key: '', name: '全部'})

      this.setState({yearRange: yearRange, semesterRange: semesterRange})
    }
  }

  state: IState = {
    yearRange: [
      {key: '', name: '大一'},
      {key: '', name: '大二'},
      {key: '', name: '大三'},
      {key: '', name: '大四'},
    ],
    semesterRange: [{key: 1, name: '第一学期'}, {key: 2, name: '第二学期'}, {key: 3, name: '第三学期'}],
    yearSelected: 0,
    semesterSelected: 0,
  }

  componentWillMount () {
    const schoolYears = Account.calSchoolYears()
    const {year, term} = Account.calYearTerm()
    const { semesterRange } = this.state
    
    if (schoolYears.length === 0) {
      return
    }

    const yearRange = [] as Array<any>
    const _strings = ["一", "二", "三", "四", "五"]

    if (this.props.showTotal) {
      yearRange.push({key: '', name: '全部'})
    }

    for(let i = 0; i < schoolYears.length; i ++) {
      yearRange.push(
        {
          key: '',
          name: '大' + _strings[i],
        }
      )
    }

    let yearSelected, semesterSelected

    schoolYears.forEach((item, index) => {
      const realIndex = this.props.showTotal ? index + 1 : index

      yearRange[realIndex].key = item

      if (item === year) {
        yearSelected = realIndex
      }
    })

    semesterRange.forEach((item, index) => {
      if (item.key === term) semesterSelected = index
    })

    this.setState({yearRange: yearRange, yearSelected: yearSelected, semesterSelected: semesterSelected}, () => {
      this.props.onChange("year", this.state.yearRange[this.state.yearSelected].key)
      this.props.onChange("semester", this.state.semesterRange[this.state.semesterSelected].key)
    })
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleChange (e) {
    this.setState({[`${e.currentTarget.id}Selected`]: e.detail.value})
    
    const type: string = e.currentTarget.id

    if (type === "year") {
      this.props.onChange("year", this.state.yearRange[e.detail.value].key)
    } else if (type === "semester") {
      this.props.onChange("semester", this.state.semesterRange[e.detail.value].key)
    }
  }

  render () {
    return (
      <View>
        <View className="form-input">
          <Label>学年</Label>
          <Picker id="year" mode="selector" value={this.state.yearSelected} range={this.state.yearRange} rangeKey='name' onChange={this.handleChange}>
            <Input disabled={true} value={this.state.yearRange[this.state.yearSelected].name}></Input>
          </Picker>
        </View>
        <View className="form-input">
          <Label>学期</Label>
          <Picker id="semester" mode="selector" value={this.state.semesterSelected} range={this.state.semesterRange} rangeKey='name' onChange={this.handleChange}>
            <Input disabled={true} value={this.state.semesterRange[this.state.semesterSelected].name}></Input>
          </Picker>
        </View>
      </View>
    )
  }
}