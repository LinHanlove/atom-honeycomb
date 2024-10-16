import type { PlasmoCSConfig } from "plasmo"
import "cropperjs/dist/cropper.css"
import { getSelectedText, Log, windowRefresh} from "~utils"
import areaScreenshot from "~utils/areaScreenshot"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Log("content收到的消息：",message, sender, sendResponse);
  const {origin, type } = message
  
  if (type === "areaScreenshot") {
    window.focus()
    areaScreenshot(message.base64).init()
    return true // 表示消息已被处理，不需要再分发
  }
  // 强制刷新
  if(type === "refresh") windowRefresh(window,chrome);
  // 获取选中文本
  if(type === "getSelectedText" && origin === "background") {
    const selectText = getSelectedText(window)
    console.log("选中文本：", selectText);
    sendResponse(selectText)
  }
})