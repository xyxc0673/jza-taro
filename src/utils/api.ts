import config from  './config'

const api = apiReset({
  notice: '/notice',

  jwVerify: '/jw/verify',
  jwScore: '/jw/score',
  jwSchedule: '/jw/schedule',

  cardVerify: '/card/verify',
  cardBalance: '/card/balance',
  cardTransaction: '/card/transaction',

  electricBuyRecord: '/electric/buy',
  electricUsedRecord: '/electric/used',

  libSearch: '/lib/search',
  libBookInfo: '/lib/book_info',
  libBookDetail: '/lib/book_detail',
  libBookCover: '/lib/book_cover',
})

function apiReset<T>(object: T): T {
  const type = config.dev ? 'dev': 'prod'
  const domain = config.domain[type]
  Object.keys(object).forEach(key => {
    object[key] = `${domain}${object[key]}`
  })
  return object
}

export default api