import {
  createTab,
  openExtension,
  openGitHubDev,
  openIntroduce,
  quickSearch,
  sendMessage
} from "~utils"

/**
 * 按键图标
 */
export const icons = [
  "emojione:honeybee",
  "noto-v1:honeybee",
  "twemoji:honeybee",
  "openmoji:honeybee",
  "noto:honeybee",
  "streamline-emojis:honeybee",
  "emojione-v1:honeybee",
  "noto-v1:honeybee",
  "streamline-emojis:ant",
  "emojione:bug",
  "logos:bugsee",
  "emojione:spider",
  "openmoji:butterfly",
  "emojione:spider-web",
  "emojione:spouting-whale",
  "emojione:whale",
  "emojione:octopus",
  "emojione:crab"
]

/**
 * 默认配置
 */
export const defaultSetting = [
  {
    alias: "baidu",
    prefix: "https://www.baidu.com/s?ie=utf-8&tn=25017023_17_dg&wd=",
    suffix: ""
  },
  { alias: "npm", prefix: "https://www.npmjs.com/search?q=", suffix: "" },
  {
    alias: "github",
    prefix: "https://github.com/search?q=",
    suffix: "&type=repositories"
  },
  {
    alias: "google",
    prefix: "https://www.google.com/search?q=",
    suffix:
      "&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg8MgYIAhBFGDwyBggDEEUYPDIGCAQQRRg8MgYIBRBFGEEyBggGEEUYPDIGCAcQRRhB0gEINTUyNWowajmoAgCwAgE&sourceid=chrome&ie=UTF-8"
  },
  {
    alias: "iconify",
    prefix: "https://icon-sets.iconify.design/?query=",
    suffix: ""
  },
  {
    alias: "csdn",
    prefix: "https://so.csdn.net/so/search?spm=1000.2115.3001.4498&q=",
    suffix: "&t=&u="
  },
  {
    alias: "juejin",
    prefix: "https://juejin.cn/search?query=",
    suffix: "&fromSeo=0&fromHistory=0&fromSuggest=0"
  },
  {
    alias: "vant",
    prefix: "https://vant.pro/vant-weapp/#/",
    suffix: ""
  },
  {
    alias: "element2",
    prefix: "https://element.eleme.cn/#/zh-CN/component/",
    suffix: ""
  },
  {
    alias: "element3",
    prefix: "https://element-plus.org/zh-CN/component/",
    suffix: ".html"
  },
  {
    alias: "antdV",
    prefix: "https://www.antdv.com/components/",
    suffix: "-cn"
  },
  {
    alias: "antdR",
    prefix: "https://ant.design/components/",
    suffix: "-cn"
  },
]

/**
 * 右键菜单列表
 */
export const menuList = [
  {
    id: "open",
    title: "open",
    onclick: function () {
      return openExtension(chrome)
    }
  },
  {
    id: "search",
    title: "search",
    onclick: function () {
      return quickSearch(chrome)
    }
  },
  {
    id: "githubDev",
    title: "githubDev",
    onclick: function () {
      return openGitHubDev()
    }
  },
  {
    id: "jsonFormatter",
    title: "jsonFormatter",
    onclick: function () {
      return createTab({
        chrome,
        url: "JsonFormatter"
      })
    }
  },
  {
    id: "compressHero",
    title: "compressHero",
    onclick: function () {
      return createTab({
        chrome,
        url: "CompressHero"
      })
    }
  },
  {
    id: "refresh",
    title: "refresh",
    onclick: function () {
      return sendMessage({
        type: "refresh",
        origin: "background",
        chrome
      })
    }
  },
  {
    id: "aboutAtom Honeycomb",
    title: "about Atom Honeycomb",
    onclick: function () {
      return openIntroduce(chrome)
    }
  }
]

/**
 * 安全页面重定向列表
 */
export const safePages = [
  {
    name: "CSDN",
    url: "link.csdn.net",
    handlers: [
      {
        type: "forward",
        start: "target="
      }
    ]
  },
  {
    name: "掘金",
    url: "link.juejin.cn",
    handlers: [
      {
        type: "forward",
        start: "target="
      }
    ]
  },
  {
    name: "简书",
    url: "jianshu.com/go-wild?ac=2",
    handlers: [
      {
        type: "forward",
        start: "url="
      }
    ]
  },
  {
    name: "知乎",
    url: "link.zhihu.com",
    handlers: [
      {
        type: "forward",
        start: "target="
      }
    ]
  },
  {
    name: "开源中国",
    url: "oschina.net/action/GoToLink",
    handlers: [
      {
        type: "forward",
        start: "url="
      }
    ]
  },
  {
    name: "码云",
    url: "gitee.com/link",
    handlers: [
      {
        type: "forward",
        start: "target="
      }
    ]
  }
]
