import { Icon } from "@iconify/react"
import { copyText, log } from "atom-tools"
import { useEffect, useState } from "react"

import "@wangeditor/editor/dist/css/style.css" // 引入 css

import type { IDomEditor, IEditorConfig } from "@wangeditor/editor"
import { Editor } from "@wangeditor/editor-for-react"

import "~/assets/style/tailwind.css"
import "~/assets/style/jsonFormatter.css"

import { notify } from "~utils"

import { JsonFormatter as formatter } from "../utils/ability/jsonFormatter"

export default function TableMarkdown() {
  const [editor, setEditor] = useState<IDomEditor | null>(null)

  const [html, setHtml] = useState("")

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: "请输入内容..."
  }

  // 销毁编辑器
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  // 格式化前的数据
  const [data, setData] = useState<string>("{}")

  // 获取json-container
  const [jsonContainer, setJsonContainer] = useState<HTMLElement>()

  // 操作栏
  const [action, setAction] = useState([
    {
      name: "quoteKeys",
      value: true
    },
    {
      name: "lineNumbers",
      value: false
    },
    {
      name: "linkUrls",
      value: true
    },
    {
      name: "linksNewTab",
      value: true
    },
    {
      name: "trailingCommas",
      value: false
    }
  ])
  // 缩进
  const [indent, setIndent] = useState(2)

  // 处理复选框变化的函数
  const handleChange = (item) => {
    const updatedAction = action.map((i) => {
      if (i.name === item.name) {
        return { ...i, value: !i.value }
      }
      return i
    })
    setAction(updatedAction)
  }

  /**
   * @function getOption
   * @description 获取操作项的值
   * @returns 返回一个对象，对象的属性名是操作项的name，属性值是操作项的value
   */
  const getOption = () => {
    let option = {}
    action.forEach((item) => {
      option[item.name] = item.value
    })
    return option
  }

  /**
   * @function 处理编辑器内容变化
   */
  const handleEditorChange = (editor) => {
    console.log("原数据", editor.getHtml())

    setHtml(editor.getHtml())
    const parser = new DOMParser()
    const doc = parser.parseFromString(editor.getHtml(), "text/html")
    console.log("解析后的数据", doc)

    // 获取表格行
    const rows = doc.querySelectorAll("table tbody tr")

    console.log("获取表格行", rows)

    // 提取表格数据并转换为对象数组
    const data = Array.from(rows).map((row) => {
      console.log("提取表格数据并转换为对象数组--->", row)

      const cells = row.querySelectorAll("td")
      console.log("提取表格数据并转换为对象数组", cells[0]?.innerText?.trim())

      return {
        key: cells[0]?.innerText?.trim(),
        type: cells[1]?.innerText?.trim(),
        required: cells[2]?.innerText?.trim(),
        description: cells[3]?.innerText?.trim()
      }
    })

    console.log("格式化后的数据", formatData(data))

    setData(JSON.stringify({ TableMarkdown: formatData(data) }))
  }

  /**
   * @function 格式化数组
   * 遇到type为List格式的，则当前key为数组，继续向下遍历，遇到key为└开头的，则当前key为数组中的元素 直到遇到下一个List或不是└开头的结束
   */
  const formatData = (data) => {
    const result = []
    const processedIndices = new Set() // 用于记录已处理的索引
    // 英文的正则
    const notEnglish = /[\u4e00-\u9fa5]/g
    if (data[0] && data[0].type.match(notEnglish)) {
      data.splice(0, 1)
    }
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (item.type === "List") {
        const list = []
        let j = i + 1
        if (!data[j].key.startsWith("└")) {
          result.push(item)
        } else {
          while (j < data.length && data[j].key.startsWith("└")) {
            processedIndices.add(j) // 标记为已处理
            const cloneData = {
              ...data[j],
              key: data[j].key.replace(/^└\s*/, "")
            }
            list.push(cloneData)
            j++
          }

          // 检查是否有嵌套的List结构
          if (list.length > 0) {
            // 递归处理嵌套的List
            const nestedList = formatData(list)
            result.push({
              [item.key]: nestedList
            })
          } else {
            // 将提取的列表项添加到结果中
            result.push({
              [item.key]: list
            })
          }
          // 跳过已处理的项
          i = j - 1 // 注意这里的调整，确保 i 指向下一个未处理的项
        }
      } else if (!processedIndices.has(i)) {
        // 只添加未处理的项
        result.push(item)
      }
    }
    return result
  }

  /**
   * @function 双击复制
   */
  const handleCopy = () => {
    const lis = document.querySelectorAll(".json-li")
    lis.forEach((li) => {
      li.addEventListener("dblclick", (e) => {
        const text = (e.target as HTMLElement).innerText
        copyText(text).then(() => {
          notify({
            message: "复制成功",
            chrome
          })
        })
      })
    })
  }

  useEffect(() => {
    try {
      setJsonContainer(document.querySelector(".json-container") as HTMLElement)
      if (!jsonContainer) return
      jsonContainer.innerHTML = formatter(JSON.parse(data || "{}"), {
        ...getOption(),
        indent: indent
      })
      handleCopy()
    } catch (error) {
      log.error(error)
    }
  }, [data, action, indent, jsonContainer])

  useEffect(() => {
    // 直接使用document对象来获取DOM元素
    const Input = document.getElementById("json-input-area")
    if (Input) Input.focus()
  }, [])

  return (
    <>
      <h2 className="title text-center text-2xl font-bold py-4">
        TableMarkdown
      </h2>
      <div className="subTitle mx-4  text-[12px] font-semibold flex ">
        <div className="waring">注意：</div>
        <div className="mb-1 ">
          复制markdown格式下的表格，解析为对应的对象数组格式
        </div>

        <div className="mx-2">|</div>
        <div className="mb-1 text-[orange]">
          <a
            title="使用文档"
            href="https://linhan.atomnotion.com/posts/about-atomHoneycomb"
            target="_blank"
            rel="noopener noreferrer">
            使用文档
          </a>
        </div>
      </div>
      <div className="container  mx-[auto] mt-4  border-2 border-gray-200 rounded-lg p-4 ">
        <div className="content  grid grid-cols-2 ">
          <div className="col-span-1  pr-4">
            <h3 className="text-xl font-bold py-2">Input:</h3>
            <div className="input-area w-full h-[70vh] overflow-y-auto p-2 border-2 border-gray-200 rounded-lg resize-none">
              <Editor
                className="h-full"
                defaultConfig={editorConfig}
                value={html}
                onCreated={setEditor}
                onChange={(editor) => handleEditorChange(editor)}
                mode="default"
                style={{ height: "500px", overflowY: "hidden" }}
              />
            </div>
          </div>
          <div className="col-span-1 pl-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold py-2">Output:</h3>

              <Icon
                icon="solar:copy-bold"
                color="#008080"
                className="w-[20px] h-[20px]"
                onClick={() => {
                  if (!jsonContainer.innerText) return
                  copyText(jsonContainer.innerText).then(() => {
                    notify({
                      message: "复制成功",
                      chrome
                    })
                  })
                }}
              />
            </div>
            <div className="output-area  w-full h-[70vh] overflow-y-auto p-2 border-2 border-gray-200 rounded-lg resize-none">
              <pre className="json-container rounded-lg" />
            </div>
          </div>
        </div>
        <div className="action flex items-center justify-end">
          <div className="text-xl font-bold ">
            <div>action：</div>
          </div>
          {/* S 多选框组 */}
          {action.map((item, index) => {
            return (
              <div className="flex items-center mr-3 " key={index}>
                <input
                  title={item.name}
                  checked={item.value}
                  onChange={() => handleChange(item)}
                  type="checkbox"
                  id={item.name}
                />
                <label className="ml-1" htmlFor={item.name}>
                  {item.name}
                </label>
              </div>
            )
          })}
          {/* E 多选框组 */}
          {/* S 缩进 */}
          <div className="flex items-center mr-3">
            <label className="ml-1" htmlFor="indent">
              indent:
            </label>
            <input
              className="ml-1 w-[50px] border-2 border-gray-200 rounded-[4px]"
              title="indent"
              type="number"
              id="indent"
              min={2}
              step={2}
              max={6}
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            />
          </div>
          {/* E 缩进 */}
        </div>
      </div>
    </>
  )
}
