import type { PlasmoCSConfig } from "plasmo"

import {
  getSelectedText,
  interceptLink,
  killCsdn,
  Log,
  windowRefresh
} from "~utils"
import areaScreenshot from "~utils/ability/AreaScreenshot"

import "~/assets/style/cropper.css"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Log("content收到的消息：", message, sender, sendResponse)
  const { origin, type,data } = message

  if (type === "areaScreenshot") {
    window.focus()
    areaScreenshot(data,chrome).init()
    return true
  }
  // 强制刷新
  if (type === "refresh") windowRefresh(window, chrome)
  // 获取选中文本
  if (type === "getSelectedText" && origin === "background") {
    const selectText = getSelectedText(window)
    console.log("选中文本：", selectText)
    sendResponse(selectText)
  }
})

/**
 * @function 取消外链的默认行为
 */
interceptLink(chrome)

/**
 * @function scdn默认打开内容，不需要点击关注
 */
killCsdn(chrome)
