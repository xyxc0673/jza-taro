# 吉珠小助手

[![GitHub](https://img.shields.io/badge/license-WTFPL-blue.svg?style=flat-square)](https://zh.wikipedia.org/wiki/WTFPL)


> 一个多年的心愿

## 预览
微信搜索同名小程序或者扫描下方小程序码即可预览

![小程序二维码](/images/qrcode.jpg)

## 开发

开发环境为 Node.js v10.13.0 和 NPM v6.4.1

开发前请确保安装了 Node.js 和 NPM

1. 安装 [Taro](https://taro.js.org/)
2. Clone 本项目 `git clone https://github.com/xyxc0673/jza-taro.git`
3. 重命名 `project.config.sample.json` 为 `project.config.json`
4. 重命名 `src/utils/config.sample.ts` 为 `src/utils/config.ts`
5. 运行 `npm install`
6. 运行 `npm run dev:weapp`
7. 使用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 打开本项目
8. 使用顺手的开发工具，享受编码的乐趣 ( :

## 功能
> 一则令人遗憾的消息：  
> 由于没有内网服务器，宿舍电费功能变得遥遥无期。

- [x] 教务系统
  - [x] 课表
    - [x] 手动添加
    - [x] 班级课表
  - [x] 成绩
    - [x] 成绩分析
- [x] 校园卡
  - [x] 余额
  - [x] 消费记录
- [x] 图书馆
  - [x] 书目检索
  - [x] 个人中心
    - [x] 借阅查询
    - [x] 续借书籍
- [ ] 宿舍电费 ( ? )
  - [ ] 余量查询
  - [ ] 购电记录
  - [ ] 用电记录
  - [ ] 充值记录
- [x] 通知
- [ ] 校历
- [ ] 百科

## 感谢

- [Taro](https://taro.js.org/)
- [Iconfont](http://www.iconfont.cn/)
- [We川大](https://github.com/mohuishou/scuplus-wechat)
- [微吉风](https://github.com/choyri/WeGifun)
- [课表](http://kb.mayuko.cn/)

## 许可
[WTFPL](https://zh.wikipedia.org/wiki/WTFPL)