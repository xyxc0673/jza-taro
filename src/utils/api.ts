import config from  './config'

const api = apiReset({
  notice: '/notice',

  jwVerify: '/jw/verify',
  jwScore: '/jw/score',
  jwSchedule: '/jw/schedule',

  jwRecommendMajor: '/jw/recommend/major',
  jwRecommendClass: '/jw/recommend/class',
  jwRecommendSchedule: '/jw/recommend/schedule',

  cardVerify: '/card/verify',
  cardBalance: '/card/balance',
  cardTransaction: '/card/transaction',

  electricBuyRecord: '/electric/buy',
  electricUsedRecord: '/electric/used',

  libSearch: '/lib/search',
  libBookInfo: '/lib/book_info',
  libBookDetail: '/lib/book_detail',
  libBookCover: '/lib/book_cover',

  libReaderLogin: '/lib/reader/login',
  libReaderCaptcha: '/lib/reader/captcha',
  libReaderInfo: '/lib/reader/info',
  libReaderRenew: '/lib/reader/renew',
  libReaderRenewCheck: '/lib/reader/renew/check',
  libReaderCurrentCheckout: '/lib/reader/checkout/current',
  libReaderCheckoutRecord: '/lib/reader/checkout/record',
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