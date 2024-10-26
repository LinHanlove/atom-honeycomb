import { clearAllCookie, log, sleep } from "atom-tools"

import { safePages } from "~common"
import { Message } from "~components/message"
import Compressor from "~utils/ability/Compressor"
import UPNG from "~utils/ability/UPNG"

import { notify, sendMessage, sendMessageRuntime } from "./common"

/**
 * @function 打开githubDev 线上查看github项目
 */
export const openGitHubDev = () => {
  notify({
    message: "启动中请稍后...",
    chrome
  })
  sendMessageRuntime({
    type: "lightIcon",
    origin: "content",
    chrome
  })
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    Log(tabs)

    const url = tabs[0].url
    const reg = /^(https?:\/\/)?(www\.)?github\.com\/(.*)\/(.*)/
    Log("github地址---->", url)

    if (!reg.test(url)) return

    // 在当前标签页后面打开新的标签页
    chrome.tabs.create({
      url: url.replace("github.com", "github.dev"),
      index: tabs[0].index + 1
    })
  })
}

/**
 * @function 强制刷新
 */
export const windowRefresh = (window: Window, chrome: any) => {
  Log("windowRefresh", window, chrome)

  window.localStorage.clear()
  window.sessionStorage.clear()
  clearAllCookie()
  window.location.reload()
  notify({
    message: "网页已刷新🥳",
    chrome
  })
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
export const copyImgToClipboard = async (image) => {
  const storage_data = await chrome.storage.sync.get(["model"])
  const model = storage_data.model || "file"
  // 复制都用户粘贴板中
  if (model === "base64") {
    navigator.clipboard.writeText(image)
  } else if (model === "file") {
    const [header, base64] = image.split(",")
    const [_, type] = /data:(.*);base64/.exec(header)
    const binary = atob(base64)
    const array = Array.from({ length: binary.length }).map((_, index) =>
      binary.charCodeAt(index)
    )
    navigator.clipboard.write([
      new ClipboardItem({
        // 这里只能写入 png
        "image/png": new Blob([new Uint8Array(array)], { type: "image/png" })
      })
    ])
  }
}

/**
 * @function 截图时禁止浏览器的一些事件
 */
export const disableBrowserEvent = () => {
  document.body.style.overflow = "hidden"
}

/**
 * @function 启用浏览器的一些事件
 */
export const enableBrowserEvent = () => {
  // 启用滚动
  document.body.style.overflow = ""
}

/**
 * @function 打印日志
 * @param msg 日志信息
 * @param other
 */
export const Log = (msg: any, ...other) => {
  log.success(msg, ...other)
}

/**
 * @function 区域截图
 */
export const openCapture = (chrome) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].windowId) return
    chrome.tabs.captureVisibleTab(
      tabs[0].windowId,
      { format: "png", quality: 100 },
      (image) => {
        if (chrome.runtime.lastError) {
          Log("截图失败:", chrome.runtime.lastError)
        } else {
          sendMessage({
            chrome,
            data: image,
            type: "areaScreenshot",
            origin: "popup"
          })
        }
      }
    )
  })
}

/**
 * @function 跳转到介绍
 */
export const openIntroduce = (chrome) => {
  chrome.tabs.create({
    url: "https://linhan.atomnotion.com/posts/about-atomHoneycomb"
  })
}

/**
 * @function 打开扩展
 */
export const openExtension = (chrome) => {
  return new Promise((resolve, reject) => {
    chrome.action.openPopup().then(() => {
      resolve(null)
    })
  })
}

/**
 * @function 快捷搜索
 */
export const quickSearch = (chrome) => {
  sendMessage({ type: "getSelectedText", origin: "background", chrome }).then(
    async (query: any) => {
      if (!query) return
      const settingLocal = (await getLocal({
        key: "setting",
        chrome
      })) as any
      const searchTargetLocal = (await getLocal({
        key: "searchTarget",
        chrome
      })) as {
        searchTarget: string
      }
      console.log(
        "settingList:",
        settingLocal.setting,
        "searchTarget:",
        searchTargetLocal
      )

      if (!settingLocal.setting || !searchTargetLocal) return
      const querySetting = JSON.parse(settingLocal.setting)[
        parseInt(searchTargetLocal.searchTarget)
      ]
      console.log("querySetting:", querySetting)

      chrome.tabs.create({
        url: `${querySetting.prefix}${query}${querySetting.suffix}`
      })
    }
  )
}

/**
 * @function 获取页面选择的文字
 */
export const getSelectedText = (window) => {
  if (window.document.selection) {
    return window.document.selection.createRange().text
  } else {
    return window.getSelection().toString()
  }
}

/**
 * @function 存储数据
 */
export const setLocal = (option) => {
  const { chrome, key, value } = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, (res) => {
      resolve(res)
    })
  })
}

/**
 * @function 读取数据
 */
export const getLocal = (option) => {
  const { chrome, key } = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (res) => {
      resolve(res)
    })
  })
}

/**
 * @function 清空数据
 */
export const clearLocal = (option) => {
  const { chrome, key } = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, (res) => {
      resolve(res)
    })
  })
}

/**
 * @function 消除网站安全页面跳转限制
 */
export const interceptLink = (chrome?: any) => {
  // @match        *://link.juejin.cn/*
  // @match        *://juejin.cn/*
  // @match        *://www.jianshu.com/p/*
  // @match        *://www.jianshu.com/go-wild?*
  // @match        *://*.zhihu.com/*
  // @match        *://tieba.baidu.com/*
  // @match        *://*.oschina.net/*
  // @match        *://gitee.com/*
  // @match        *://leetcode.cn/link/*
  // @match        *://blog.51cto.com/*
  // @match        *://*.baidu.com/*

  for (let safePage of safePages) {
    if (!location.href.includes(safePage.url)) continue
    sendMessageRuntime({
      type: "lightIcon",
      origin: "content",
      chrome
    })
    // 清除网站弹窗
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    for (let handler of safePage.handlers) {
      // 处理跳转
      document.body.append(
        Message({
          title: "Atom Honeycomb提醒您！正在跳转...",
          subTitle: decodeURIComponent(location.href.split(handler.start)[1])
        })
      )
      location.replace(
        decodeURIComponent(location.href.split(handler.start)[1])
      )
      return
    }
  }
}

/**
 * @function 消除csdn一些垃圾限制
 * @description 经过分析发现，点击关注展开其实只是样式层面上的隐藏，
 * 所以找到对应类名修改样式就可以了
 * 按钮class【hide-article-box hide-article-pos text-center】
 * 内容id【article_content】
 */
export const killCsdn = (chrome?: any) => {
  const scdnWhiteLink = "https://blog.csdn.net/"
  console.log(location.href.includes(scdnWhiteLink))

  if (!location.href.includes(scdnWhiteLink)) return
  const hideArticleBox = document.querySelector(
    ".hide-article-box"
  ) as HTMLElement
  const articleContent = document.querySelector(
    "#article_content"
  ) as HTMLElement
  console.log(hideArticleBox, articleContent)

  if (hideArticleBox) {
    sendMessageRuntime({
      type: "lightIcon",
      origin: "content",
      chrome
    })
    hideArticleBox.style.display = "none"
    articleContent.style.height = "auto"
  }
}

/**
 * @function 点亮徽标
 */
export const lightIcon = (option) => {
  const { chrome, color, text, textColor } = option
  console.log(chrome.action, color, text, textColor)
  chrome.action.setBadgeText({ text: text || "🐝" })
  chrome.action.setBadgeTextColor({ color: textColor || "#fff" })
  chrome.action.setBadgeBackgroundColor({ color: color || "#fff" })

  // 5秒后关闭
  sleep(5000).then(() => {
    chrome.action.setBadgeText({ text: "" })
  })
}

/**
 * @function 定义将Blob转换为File的函数
 */
export const blobToFile = (blob, extraData) => {
  return new File([blob], extraData.fileName, {
    type: blob.type,
    lastModified: Date.now()
  })
}

/**
 * @function 压缩图片
 * @description 使用UPNG库
 * @param file 要压缩的文件
 * @returns Promise<File>
 */
export const UPNG_PNG = async (file: File, quality: number): Promise<File> => {
  const arrayBuffer = await file.arrayBuffer()
  const decoded = UPNG.decode(arrayBuffer)
  const rgba8 = UPNG.toRGBA8(decoded)

  // 这里 保持宽高不变，保持80%的质量（接近于 tinypng 的压缩效果）
  const compressed = UPNG.encode(
    rgba8,
    decoded.width,
    decoded.height,
    256 * quality
  )
  return new File([compressed], file.name, { type: "image/png" })
}

/**
 * @function 压缩图片
 * @description 使用Compressor库
 * @param file 要压缩的文件
 * @returns Promise<File>
 */
export const Compressor_PNG = async (
  file: File,
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    console.log(file, quality)

    new Compressor(file, {
      quality,
      success(result) {
        resolve(result)
      },
      error(err) {
        reject(err)
      }
    })
  })
}

/**
 * @function formatFileSize
 * @description 根据文件大小换算单位
 * @returns string
 */
export const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + "B"
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB"
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + "MB"
  }
}

/**
 * @function convertImageFormat
 * @description 将图片转换为需要的格式
 * @param file 要转换的文件
 * @param quality 压缩质量
 * @param callback 回调函数
 */
export const convertImageFormat = (option): Promise<File> => {
  const { file, quality = 1, format } = option
  return new Promise((resolve, reject) => {
    // 使用FileReader读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      // 将读取到的数据URL转换为Image对象
      const img = new Image()
      img.onload = async () => {
        // 创建canvas并设置宽高为图片的宽高
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height

        // 将图片绘制到canvas上
        ctx.drawImage(img, 0, 0)

        // 将canvas上的图片转换为指定格式的DataURL
        const formatImage = canvas.toDataURL(`image/${format}`, quality)
        // DataURL转换为File对象
        const blob = await dataURLtoBlob(formatImage)
        // Blob对象转换为File对象
        const fileObj = new File(
          [blob],
          file.name.split(".")[0] + `.${format}`,
          { type: blob.type }
        )
        resolve(fileObj)
      }
      img.src = e.target.result as string
    }
    reader.onerror = (e) => {
      console.error("Error reading file", e)
      reject(e)
    }
    reader.readAsDataURL(file) // 读取文件内容并转换为DataURL
  })
}

/**
 * @function dataURLtoBlob
 * @description 将数据URL转换为Blob对象
 * @param {string} dataurl 数据URL字符串
 * @returns {Promise<Blob>} Blob对象
 */
export const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",")
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
