const dev = true

const domain = {
  dev: 'http://127.0.0.1:1080',
  prod: 'https://api.test.com'
}

const apiBaseUrl = {
  dev: domain['dev'],
  prod: `${domain['prod']}/api`
}

const shareImageUrl = `${domain['prod']}/images/shareImage.png`

export default {
  dev,
  domain,
  apiBaseUrl,
  shareImageUrl,
}