import Taro, {Component, Config} from '@tarojs/taro'
import { View, ScrollView, Label, Text, Input, Button, Form, Image, Icon } from '@tarojs/components'
import './search.scss'

import FloatLayout from '../../components/float-layout'
import Panel from '../../components/panel/index'

import utils from '../../utils/utils'
import request from '../../utils/request'

interface IBook {
  title: string,
  author: string,
  callNo: string,
  docTypeName: string,
  isbn: string,
  marcNo: string,
  publishYear: string,
  publisher: string,

  imageUrl: string,
  totalNumber: string,
  remainNumber: string,

  summary: string,
  books: ICollection[],
}

interface ICollection {
  barCode: string,
  location: string,
  year: string,
  state: string,
}

interface IState {
  keyword?: string,
  books?: IBook[],
  count?: number,
  nextPage?: number,
  totalCount?: number,
  bookDetail: IBook,

  searchInputFocus: boolean,
  startSearch: boolean,
  hideSearchArea: boolean,
  showDetailCard: boolean,
}

export default class Index extends Component<{IState}, {}> {
  config: Config = {
    navigationBarTitleText: '书目检索'
  }

  state: IState = {
    keyword: '',
    books: [],
    nextPage: 0,
    totalCount: 0,
    bookDetail: {} as IBook,

    searchInputFocus: false,
    startSearch: false,
    hideSearchArea: false,
    showDetailCard: false,
  }

  async componentWillMount () {
    let params = this.$router.params
    if (params.keyword) {
      this.setState({keyword: params.keyword}, () => {
        this.onSearch(true)
      })
    } else if (params.marc_no && params.isbn) {
      let data = await this.getBookInfo(params.isbn, params.marc_no)
      if (!data) {
        return
      }
      this.onOpenDetial(data)
    }
  }

  componentDidMount () {
  }

  componentDidShow () {

  }

  componentDidHide () {

  }

  onReachBottom () {
    if (!this.state.startSearch) {
      return
    }
    this.onSearch(false)
  }

  onShareAppMessage () {
    let path = '/pages/library/search/index?'
    if (this.state.showDetailCard) {
      path += 'marc_no=' + this.state.bookDetail.marcNo + '&isbn=' + this.state.bookDetail.isbn
    } else {
      path += 'keyword=' + this.state.keyword
    }
    return {title: '我分享了一本书籍给你', path: path}
  }

  onInput (e) {
    this.setState({keyword: e.detail.value})
  }

  handleSubmit () {
    this.setState({books: []}, () => {
      this.onSearch(true)
    })
  }


  closeDetailCard () {
    this.setState({showDetailCard: false})
  }

  handleClearClick () {
    this.setState({keyword: '', searchInputFocus: true})
  }

  handleBlur () {
    this.setState({searchInputFocus: false})
  }

  handleSearchFocus () {
    this.setState({searchInputFocus: true})
  }

  async onOpenDetial (bookItem: IBook) {
    let response = await request.libBookDetail({isbn: bookItem.isbn, marcNo: bookItem.marcNo})
    if (!response) {
      return
    }

    bookItem = Object.assign(bookItem, {books: response.data.data.books, summary: response.data.data.detail.summary})
    this.setState({bookDetail: bookItem, showDetailCard: true})
  }

  async onSearch (start: boolean) {
    if (!this.state.keyword) {
      Taro.showToast({title: '请输入搜索关键词', icon:'none'})
      return
    }

    let page = 1

    if (!start && this.state.nextPage) {
      page = this.state.nextPage
    }

    let response = await request.libSearch({keyword: this.state.keyword, page: page})
    
    if (!utils.isObj(response.data.data) && response.data.data.count === 0) {
      return
    }

    this.setResponse(response, start)
  }

  async setResponse(response, start) {
    let books = response.data.data.books

    if (books.length === 0) {
      Taro.showToast({title: '没有更多记录了', icon: 'none'})
      return
    }

    if (!start && this.state.books) {
      books = this.state.books.concat(books)
    }

    this.setState({
      startSearch: true,
      books: books,
      count: response.data.data.count,
      nextPage: response.data.data.next_page,
      totalCount: response.data.data.total_count,
    }, async () => {
      if (!this.state.books) {
        return
      }
      let tmpBooks
      for (let bookItem of this.state.books) {
        let data = await this.getBookInfo(bookItem.isbn, bookItem.marcNo)
        if (!utils.isObj(data)) {
          continue
        }
        let _tmp = Object.assign(bookItem, data)
        tmpBooks = Object.assign(this.state.books, _tmp)
        this.setState({books: tmpBooks})
      }
    })
  }

  async getBookInfo (isbn: string, marcNo: string) {
    let response = await request.libBookInfo({isbn: isbn, marcNo: marcNo})
    
    if (!utils.isObj(response.data) && response.data.code === -1) {
      return
    }

    return response.data.data.details
  }

  render () {
    const defaultImage = require('../../asserts/images/default_book.svg')
    let bookItemsView

    if (this.state.books) {
      bookItemsView = this.state.books.map((bookItem) => {
        return (
          <View className='card book-item' key={bookItem.marcNo} onClick={this.onOpenDetial.bind(this, bookItem)}>
            <Image className='book-item__image' src={bookItem.imageUrl ? bookItem.imageUrl : defaultImage} />
            <View className='book-item__wrap'>
              <Text className='book-item__title'>{bookItem.title}</Text>
              <Text className='book-item__author'>{bookItem.author} / {bookItem.publisher} / {bookItem.publishYear}</Text>
              <Text className='book-item__call_no'>{bookItem.callNo}</Text>
            </View>
            <View className='book-item-right'>
              <Text className='book-item__remain'>馆 藏</Text>
              <Text className='book-item__remain'>{bookItem.totalNumber}</Text>
              <Text className='book-item__remain'>可 借</Text>
              <Text className='book-item__remain'>{bookItem.remainNumber}</Text>
            </View>
          </View>
        )
      })
    }

    let searchResultView
    if (this.state.startSearch && this.state.books) {
      searchResultView = (
        <View>
          {
            this.state.totalCount === 0
            ? <View className='book-number-tips'>0 条记录</View>
            : <View className='book-number-tips'>显示 {this.state.books.length} / {this.state.totalCount} 条记录</View>
          }
          {
            this.state.books.length > 0 ?
            <View className='book-list'>
              {bookItemsView}
            </View>
            : null
          }

        </View>
      )
    }
    

    return (
      <View className='page'>
        <Form className={`form ${this.state.hideSearchArea ? 'hide' : ''}`} onSubmit={this.handleSubmit}>
          <View className='form-input'>
            <Label>关键词</Label>
            <Input id='keyword' value={this.state.keyword} onInput={this.onInput} placeholder='请输入关键词' focus={this.state.searchInputFocus} onBlur={this.handleBlur} onConfirm={this.handleSubmit}></Input>
            <Icon className={`clear ${this.state.keyword === '' ? 'hide' : ''}`} type='clear' size='20' onClick={this.handleClearClick}/>
          </View>
          <Button className='btn' formType='submit'>检索</Button>
        </Form>
        {!this.state.startSearch
          ? (
            <View className="tips">
              <View>输入完敲 enter 键就可以搜索啦！</View>
            </View>
          )
          : null
        }
        <View className='float-corner' onClick={this.handleSearchFocus}>
          <Image src={require('../../asserts/images/search.svg')} />
        </View>

        <FloatLayout title={this.state.bookDetail.title} isOpened={this.state.showDetailCard} onClose={this.closeDetailCard}>
          <View className='container'>
            <Panel title='信息' none={false} marginBottom={0} padding="20rpx 20rpx 20rpx">
              <Text className='info'>{this.state.bookDetail.author} / {this.state.bookDetail.publisher} / {this.state.bookDetail.publishYear} / isbn: {this.state.bookDetail.isbn} / 索书号: {this.state.bookDetail.callNo}</Text>
            </Panel>

            <Panel title='简介' padding="20rpx 20rpx 20rpx" marginBottom={0}>
              {this.state.bookDetail.summary === ''
                ? <View className="none-text">豆瓣上暂时没有该书刊的信息😥</View>
                : <ScrollView scrollY className='summary'>{this.state.bookDetail.summary}</ScrollView>
              }
            </Panel>
            <Panel title='馆藏' none={false} padding="20rpx 20rpx 20rpx" marginBottom={0}>
              <View className='collection-item title'>
                <Text className='collection-item__first'>位置</Text>
                  <Text className='collection-item__second'>条形码/年卷期</Text>
                  <Text className='collection-item__last'>状态</Text>
              </View>
              <ScrollView scrollY className='collection'>
              {
                this.state.bookDetail && this.state.bookDetail.books.map((collectionItem) => {
                  return (
                    <View className='collection-item' key={collectionItem.barCode}>
                      <Text className='collection-item__first'>{collectionItem.location}</Text>
                      <Text className='collection-item__second'>{collectionItem.barCode ? collectionItem.barCode : collectionItem.year}</Text>
                      <Text className={`collection-item__last ${collectionItem.state === '可借' ? 'avalible-text': ''}`}>{collectionItem.state}</Text>
                    </View>
                  )
                })
              }
              </ScrollView>
            </Panel>
          </View>
        </FloatLayout>
        {searchResultView}
      </View>
    )
  }
}