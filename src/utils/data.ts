const version = '0.4.4(190909)'

const changeLog = [
  '新增 设置关于页面增加交流QQ群',
  '调整 班级课表可查询2019级以及默认选中最新年级',
]

const newFuture = '班级课表已经可以查询2019级啦！另外，关于页面增加了交流QQ群哦！'

const collegeRange = [
  {
    key: "01",
    name: "美术与设计学院",
  },
  {
    key: "02",
    name: "工商管理学院",
  },
  {
    key: "03",
    name: "电子信息工程学院",
  },
  {
    key: "04",
    name: "计算机学院",
  },
  {
    key: "05",
    name: "旅游学院",
  },
  {
    key: "06",
    name: "机械工程学院",
  },
  {
    key: "07",
    name: "文学院",
  },
  {
    key: "08",
    name: "公共管理学院",
  },
  {
    key: "09",
    name: "外国语学院",
  },
  {
    key: "10",
    name: "药学与食品科学学院",
  },
  {
    key: "11",
    name: "建筑与城乡规划学院",
  },
  {
    key: "12",
    name: "金融与贸易学院",
  },
  {
    key: "13",
    name: "物流管理与工程学院",
  },
  {
    key: "14",
    name: "音乐舞蹈学院",
  },
  {
    key: "30",
    name: "公共外语教育学院",
  },
  {
    key: "31",
    name: "公共基础与应用统计学院",
  },
  {
    key: "20",
    name: "国际教育交流学院",
  },
  {
    key: "21",
    name: "继续教育学院",
  },
  {
    key: "40",
    name: "体育科学学院",
  },
  {
    key: "52FC430D779579B8E053B41010AC6C9A",
    name: "健康学院",
  },
  {
    key: "60582B90B4F05F84E053C01010AC9A4F",
    name: "创新创业学院",
  },
  {
    key: "10726",
    name: "化工与新能源材料学院",
  }
]

const gradeRange = [
  {
    key: '2015',
    name: '2015级',
  },
  {
    key: '2016',
    name: '2016级',
  },
  {
    key: '2017',
    name: '2017级',
  },
  {
    key: '2018',
    name: '2018级',
  },
  {
    key: '2019',
    name: '2019级',
  },
]

const yearSemesterRange = [
  [
    {
      key: '2015',
      name: '2015-2016',
    },
    {
      key: '2016',
      name: '2016-2017',
    },
    {
      key: '2017',
      name: '2017-2018',
    },
    {
      key: '2018',
      name: '2018-2019',
    }
  ],
  [
    {
      key: '1',
      name: '第一学期',
    },
    {
      key: '2',
      name: '第二学期',
    },
    {
      key: '3',
      name: '第三学期',
    }
  ]
]

const magicBoxItems = [
  {
    title: '教务系统',
    pageUrl: '',
    bindState: 'showJWFloatLayout',
    imageUrl: require('../asserts/images/grid_schedule.svg')
  },
  {
    title: '校园卡',
    pageUrl: '',
    bindState: 'showCardFloatLayout',
    imageUrl: require('../asserts/images/grid_card.svg')
  },
  {
    title: '图书馆',
    pageUrl: '',
    bindState: 'showLibFloatLayout',
    imageUrl: require('../asserts/images/grid_book.svg')
  },
  // {
  //   id: '3',
  //   title: '校历',
  //   pageUrl: '/pages/common/testing/index',
  //   imageUrl: require('../../asserts/images/grid_calendar.svg')
  // },
  {
    title: '设置',
    pageUrl: '/pages/common/setting/index',
    imageUrl: require('../asserts/images/grid_settings.svg')
  }
]

const scheduleItems = [
  {
    title: '我的课表',
    pageUrl: '/pages/edu/schedule/schedule',
    imageUrl: require('../asserts/images/schedule.svg')
  },
  {
    title: '班级课表',
    pageUrl: '/pages/edu/schedule/recommend',
    imageUrl: require('../asserts/images/recommend.svg')
  },
  {
    title: '课表设置',
    pageUrl: '/pages/edu/schedule/setting',
    imageUrl: require('../asserts/images/setting.svg')
  },
  {
    title: '教务成绩',
    pageUrl: '/pages/edu/score/index',
    imageUrl: require('../asserts/images/score.svg')
  },
]

export default {
  version,
  changeLog,
  newFuture,
  collegeRange,
  gradeRange,
  yearSemesterRange,
  magicBoxItems,
  scheduleItems,
}