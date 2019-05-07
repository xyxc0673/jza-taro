const devType = 'mock'

const domain = {
  dev: 'http://127.0.0.1:1080',
  mock: "http://api.mock.com",
  prod: 'https://api.test.com'
}

const apiBaseUrl = {
  dev: domain['dev'],
  mock: domain['mock'],
  prod: `${domain['prod']}/api`
}

const shareImageUrl = `${domain['prod']}/images/shareImage.png`

export default {
  devType,
  domain,
  apiBaseUrl,
  shareImageUrl,
}