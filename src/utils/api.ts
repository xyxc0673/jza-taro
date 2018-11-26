import config from  './config'

const api = {
  notice: '/notice',

  jwVerify: '/jw/verify',
  jwScore: '/jw/score',
  jwSchedule: '/jw/schedule',

  cardVerify: '/card/verify',
  cardBalance: '/card/balance',
  cardTransaction: '/card/transaction',

  eletricBuyRecord: '/eletric/buy',
  eletricUsedRecord: '/eletric/used',

  libSearch: '/lib/search',
  libBookInfo: '/lib/book_info',
  libBookDetail: '/lib/book_detail',
  libBookCover: '/lib/book_cover',
}

export default function (k) {
  const type = config.dev ? 'dev': 'prod'
  return config.domain[type] + api[k]
}