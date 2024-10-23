import { Icon } from "@iconify/react"
import { copyText, log } from "atom-tools"
import { useEffect, useState } from "react"

import "~/assets/style/tailwind.css"
import "~/assets/style/jsonFormatter.css"

import { notify } from "~utils"

import { JsonFormatter as formatter } from "../utils/ability/jsonFormatter"

export default function JsonFormatter() {
  // 格式化前的数据
  const [data, setData] = useState<string>("{}")

  // 获取json-container
  const [jsonContainer, setJsonContainer] = useState<HTMLElement>()

  // 操作栏
  const [action, setAction] = useState([
    {
      name: "quoteKeys",
      value: false
    },
    {
      name: "lineNumbers",
      value: true
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
        JsonFormatter
      </h2>
      <div className="subTitle mx-4  text-[10px] font-semibold flex ">
        <div className="waring">注意：</div>
        <div className="mb-1 ">
          在【lineNumbers】模式下双击格式化后的行可复制到剪切板
        </div>
        <div className="mx-2">|</div>
        <div className="mb-1">缩进可调整</div>
        <div className="mx-2">|</div>
        <div className="mb-1 ">操作项可多选</div>
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
      <div className="container border-2 border-gray-200 rounded-lg p-4 mx-4">
        <div className="content  grid grid-cols-2 ">
          <div className="col-span-1  pr-4">
            <h3 className="text-xl font-bold py-2">Input:</h3>
            <div className="input-area">
              <textarea
                id="json-input-area"
                title="json-input-area"
                className="w-full h-[70vh] p-2 border-2 border-gray-200 rounded-lg resize-none"
                inputMode="text"
                onChange={(e: any) => setData(e.target.value)}
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
