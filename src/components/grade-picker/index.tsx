import Taro, {Component} from '@tarojs/taro'
import {View, Label, Input, Picker} from '@tarojs/components'

import './index.scss'

interface IProps {
  onChange: Function,
  showTotal?: boolean,
  schoolYears: Array<any>,
  year: number,
  semester: number,
}

interface IState {
  yearRange: Array<any>,
  semesterRange: Array<any>,
  yearSelected: number,
  semesterSelected: number,

  schoolYears: Array<any>,
  year: number,
  semester: number,
}

export default class GradePicker extends Component<IProps, {}> {
  static defaultProps = {
    showTotal: false,
  }


  constructor (props) {
    super (...arguments)
    const { showTotal, schoolYears, year, semester } = props
    const { yearRange, semesterRange } = this.state
    if (showTotal) {
      yearRange.unshift({key: '', name: '全部'})
      semesterRange.unshift({key: '', name: '全部'})
    }

    this.setState({ yearRange, semesterRange, schoolYears, year, semester })

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
    schoolYears: [],
    year: 0,
    semester: 0,
  }

  componentWillMount () {
    this.init()
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  componentWillReceiveProps (nextProps) {
    const { schoolYears, year, semester } = nextProps
    if ( this.props.schoolYears === schoolYears && this.props.year === year && this.props.semester === semester) {
      return
    }
    this.setState({ schoolYears, year, semester }, () => {
      this.init()
    })
  }

  init () {
    const { semesterRange, schoolYears, year, semester } = this.state
    
    if (schoolYears.length === 0) {
      return
    }

    const yearRange = [] as Array<any>
    const _strings = ["一", "二", "三", "四", "五"]

    for(let i = 0; i < schoolYears.length; i ++) {
      yearRange.push(
        {
          key: '',
          name: '大' + _strings[i],
        }
      )
    }

    if (this.props.showTotal) {
      yearRange.unshift({key: '', name: '全部'})
    }

    let yearSelected = 0, semesterSelected = 0 // 必须初始化为 0，不然遇到 handleChange 遇到 name 为 全部 的时候，传进来的 year 为 ''，yearSelected 就是 undefined 了

    yearRange.forEach((item, index) => {
      if (item.name !== '全部') {
        item.key = schoolYears[index-1]
      }
      if (item.key === year) {
        yearSelected = index
      }
    })

    semesterRange.forEach((item, index) => {
      if (item.key === semester) semesterSelected = index
    })

    this.setState({yearRange: yearRange, yearSelected: yearSelected, semesterSelected: semesterSelected}, () => {
      this.props.onChange("year", this.state.yearRange[this.state.yearSelected].key)
      this.props.onChange("semester", this.state.semesterRange[this.state.semesterSelected].key)
    })
  }

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