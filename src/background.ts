import { menuList } from "~common"
import { createTab, lightIcon, Log, openCapture, openGitHubDev } from "~utils"

/**
 * @function 监听快捷键命令
 */
chrome.commands.onCommand.addListener((command) => {
  Log(`Command "${command}" triggered-bg`)
  // md表格格式转换
  if (command === "tableMarkdown")
    createTab({
      chrome,
      url: "TableMarkdown"
    })
  // jsonFormatter
  if (command === "jsonFormatter")
    createTab({
      chrome,
      url: "JsonFormatter"
    })
  // 打开githubDev
  if (command === "openGitHubDev") openGitHubDev()
  // 图片压缩
  if (command === "compressHero")
    createTab({
      chrome,
      url: "CompressHero"
    })
})

/**
 * @function 监听消息
 */
/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Log("background收到的消息：", message, sender, sendResponse)
  const { origin, type, data } = message
  if (origin === "content") {
    if (type === "lightIcon")
      lightIcon({
        chrome
      })
  }
})

/**
 * @function 创建右键菜单
 */
menuList.forEach((item) => {
  chrome.contextMenus.create({
    id: item.id,
    title: item.title,
    contexts: ["all"]
  })
})

/**
 * @function 右键菜单点击事件
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const active = menuList.find((item) => item.id === info.menuItemId)
  if (active) active.onclick()
})
