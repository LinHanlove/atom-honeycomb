import { Icon } from "@iconify/react"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "~/assets/style/tailwind.css"
import "~/assets/style/cropper.css"

import { defaultSetting, icons } from "~common"
import { Input } from "~components/atomInput"
import {
  createTab,
  getLocal,
  Log,
  notify,
  openCapture,
  openGitHubDev,
  openIntroduce,
  sendMessage,
  setLocal
} from "~utils"

const cssText = require("~/assets/style/base.css")

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Content = () => {
  // 是否打开设置模态框
  const [showModel, setSetModel] = useStorage("false")
  // 是否打开修改模态框
  const [showEditModel, setShowEditModel] = useState("false")

  // 快捷搜索设置
  const [setting, setSetting] = useState<any>([])

  // 是否展示设置
  const openSetting = () => {
    setSetModel(showModel === "true" ? "false" : "true")
  }

  // 是否展示删除
  const openDelete = () => {
    setShowEditModel(showEditModel === "true" ? "false" : "true")
  }

  // 别名
  const [alias, setAlias] = useState("")
  // 前缀
  const [prefix, setPrefix] = useState("")
  // 后缀
  const [suffix, setSuffix] = useState("")

  // 快捷搜索
  const [search, setSearch] = useState("")

  // 搜索目标
  const [searchTarget, setSearchTarget] = useState<string>()

  // 随机生成图标
  const randomIcon = () => {
    return icons[Math.floor(Math.random() * icons.length)]
  }

  // 菜单
  const menuList = [
    {
      title: "截图",
      icon: "tabler:screenshot",
      iconColor: "#00c983",
      event: () => openCapture(chrome)
    },
    {
      title: "JsonFormatter",
      icon: "si:json-alt-1-fill",
      iconColor: "",
      event: () =>
        createTab({
          chrome,
          url: "JsonFormatter"
        })
    },
    {
      title: "CompressHero",
      icon: "pajamas:doc-compressed",
      iconColor: "orange",
      event: () =>
        createTab({
          chrome,
          url: "CompressHero"
        })
    },
    {
      title: "GithubDev",
      icon: "line-md:github-loop",
      iconColor: "",
      event: () => openGitHubDev()
    },
    {
      title: "TableMarkdown",
      icon: "material-symbols:markdown",
      iconColor: "",
      event: () =>
        createTab({
          chrome,
          url: "TableMarkdown"
        })
    },
    {
      title: "刷新",
      icon: "eos-icons:arrow-rotate",
      iconColor: "",
      event: () =>
        sendMessage({
          type: "refresh",
          origin: "popup",
          chrome
        })
    },
    {
      title: "设置预设",
      icon: "tabler:settings-star",
      iconColor: "orange",
      event: () => openSetting()
    },
    {
      title: "删除预设",
      icon: "mdi:delete-outline",
      iconColor: "red",
      event: () => openDelete()
    }
  ]

  /**
   * @function 添加快捷搜索
   * @returns
   */
  const onSubmit = () => {
    const newSetting = {
      alias,
      prefix,
      suffix
    }

    if (!alias || !prefix) return setSetModel("false")

    if (setting.find((item: any) => item.alias === alias)) {
      notify({
        message: "别名已存在",
        timeout: 1500,
        chrome
      }).then(() => {
        setSetModel("false")
      })

      return
    }

    setSetting([...setting, newSetting])
    setSearchTarget(searchTarget)
    setLocal({
      key: "setting",
      value: JSON.stringify([...setting, newSetting]),
      chrome
    })
    setLocal({
      key: "searchTarget",
      value: searchTarget,
      chrome
    })
    setSetModel("false")
  }

  /**
   * @function 一键导入预设
   */
  const onImport = async () => {
    const settingLocal = (await getLocal({
      key: "setting",
      chrome
    })) as any

    const setting = JSON.parse(settingLocal.setting || "[]")

    if (!setting.length) {
      setLocal({
        key: "setting",
        value: JSON.stringify(defaultSetting),
        chrome
      })
      setSetting(defaultSetting)
      setSetModel("false")
      return
    }
    // 将不包含重复的alias 新设置合并到旧设置中
    const filterNewSetting = defaultSetting.filter(
      (i) => !setting.some((item: any) => item.alias === i.alias)
    )
    if (!filterNewSetting.length) {
      notify({
        message: "没有新的预设可以导入",
        chrome
      }).then(() => {
        setSetModel("false")
      })
    }
    Log(filterNewSetting)
    setLocal({
      key: "setting",
      value: JSON.stringify([...setting, ...filterNewSetting]),
      chrome
    })
    setSetting([...setting, ...filterNewSetting])
    setSetModel("false")
  }

  /**
   * @function 删除快捷搜索
   * @param key 当前点击的key
   */
  const onDelete = (key: string) => {
    const newSetting = setting.filter(
      (item: any, index: number) => item.alias !== key
    )
    Log(newSetting)
    setSetting([...newSetting])
    setLocal({
      key: "setting",
      value: JSON.stringify([...newSetting]),
      chrome
    })
  }

  /**
   * @function 点击搜索
   * @returns
   */
  const onSearch = async () => {
    if (!search) return
    const target = setting[parseInt(searchTarget)]
    window.open(
      `${target.prefix}${encodeURIComponent(search)}${target.suffix}`,
      "_blank"
    )
  }

  // 设置搜索目标
  const onSetSearchTarget = (idx: string) => {
    setSearchTarget(idx.toString())
    setLocal({
      key: "searchTarget",
      value: idx.toString(),
      chrome
    })
  }

  useEffect(() => {
    // 直接使用document对象来获取DOM元素
    const searchInput = document.getElementById("searchInput")
    getLocal({
      key: "searchTarget",
      chrome
    }).then((res: any) => {
      if (!res.searchTarget) {
        setLocal({
          key: "searchTarget",
          value: "0",
          chrome
        })
      }
      setSearchTarget(res.searchTarget)
    })
    getLocal({
      key: "setting",
      chrome
    }).then((res: any) => {
      res.setting && setSetting(JSON.parse(res.setting || []))
    })
    if (searchInput) searchInput.focus()
  }, [])

  return (
    <div
      style={{
        width: "420px",
        minHeight: "340px"
      }}>
      <header className="text-center text-[18px] text-[#000] font-bold  py-2 border-b-[1px] border-[orange]">
        Atom Honeycomb
      </header>
      {/* S 快捷输入框 */}
      <div className="px-2 pb-3 mt-2">
        <p className="text-[#000] text-[14px] font-medium mb-2">快捷搜索</p>
        <div className="w-full  flex justify-between items-center ">
          <Input
            id="searchInput"
            onInput={(e) => setSearch(e)}
            placeholder="输入关键字"
            width={340}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch()
              }
            }}
          />
          <div>
            <button
              className="atom-button--small"
              type="button"
              title="Search"
              onClick={onSearch}>
              <Icon
                icon="ion-md-search"
                className="w-[20px] h-[20px] text-[#00c983] "
              />
            </button>
          </div>
        </div>
      </div>
      {/* E 快捷输入框 */}

      {/* S 功能区 */}
      <div className="menu h-[180px] px-3 border-t-[1px] border-r-[1px] border-[#f4f7f6] flex justify-between  pt-3 gap-2 overflow-y-auto">
        <div className="w-[150px] h-0  gap-y-2 grid grid-cols-2 items-start  ">
          {menuList.map((item, index) => {
            return (
              <div
                key={index}
                className="col-span-1 group flex justify-center items-center flex-col text-nowrap ">
                {/* 点击截图 */}
                <button
                  className="atom-button--small !shrink-0"
                  type="button"
                  title={item.title}
                  onClick={item.event}>
                  <Icon
                    style={{ color: item.iconColor }}
                    icon={item.icon}
                    className="w-[20px] h-[20px] "
                  />
                </button>
                {/* 点击截图 */}
                <div className="mt-1 group-hover:text-[orange]">
                  {item.title}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex-1  h-0 gap-y-2 grid grid-cols-4 items-start pl-2 ">
          {setting.length > 0 &&
            setting.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="col-span-1 group flex justify-center items-center flex-col ">
                  {/* 点击搜索 */}
                  <button
                    className={`atom-button--small ${
                      searchTarget === idx.toString() && "active"
                    } !shrink-0`}
                    type="button"
                    title="搜索预设"
                    onClick={() => onSetSearchTarget(idx.toString())}>
                    <Icon
                      icon={randomIcon()}
                      className=" text-[orange] w-[20px] h-[20px] "
                    />
                  </button>
                  {/* 点击搜索 */}
                  <p
                    className={`w-full text-center mt-1 ${
                      searchTarget === idx.toString() &&
                      "text-[orange] font-bold"
                    } group-hover:text-[orange] `}>
                    {item.alias}
                  </p>
                </div>
              )
            })}
        </div>
      </div>
      {/* E 功能区 */}

      {/* S 介绍 */}
      <div
        className="fixed  bottom-[10px] right-[10px] text-[12px] text-[#818999] cursor-pointer"
        onClick={() => openIntroduce(chrome)}>
        关于 <span className="text-[orange] ">Atom Honeycomb</span>
      </div>
      {/* E 介绍 */}

      {/* S 设置模态框 */}
      {showModel === "true" && (
        <div className="modal fixed z-[9999] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[80%] bg-[#fff] px-[10px] pb-[16px] pt-2 rounded-xl  shadow-2xl">
          <p className=" text-[14px] font-bold">设置预设</p>
          <div className="modal-content text-[12px]">
            <p className="mt-1 pb-1 text-[#818999] text-[10px]">
              可输入支持url参数拼接搜索参数的网址 示例：
            </p>
            <p className=" w-full text-nowrap mt-1">
              <span className="bg-[#f4f7f6] p-1 rounded-[6px] ">
                https://github.com/search?q=搜索值&type=repositories
              </span>
            </p>
          </div>
          <div>
            <p className="py-1 text-[#818999]">名称</p>
            <Input
              onInput={(e) => setAlias(e)}
              placeholder="设置关键字别名"
              width={100}
            />
          </div>
          <div>
            <p className="py-1 text-[#818999]">设置规则</p>
            <div className=" flex items-center justify-between">
              <Input
                onInput={(e) => setPrefix(e)}
                placeholder="前缀,例：https://..."
              />
              <div className="text-[12px] text-[#999] flex items-center h-full">
                + 搜索值 +
              </div>
              <Input
                onInput={(e) => setSuffix(e)}
                placeholder="后缀，没有可不填"
              />
            </div>
          </div>

          <div className="w-full flex justify-center items-center mt-5">
            <button
              className="atom-button--small !w-auto !px-2 text-nowrap text-[teal] ml-6"
              type="button"
              title="确定"
              onClick={async () => onSubmit()}>
              确定
              <Icon
                icon="tabler:settings-star"
                className=" text-[orange] w-[14px] h-[14px] ml-1"
              />
            </button>
          </div>

          <div className="title flex items-center justify-end mt-4">
            <p
              className="flex items-center text-[#818999] text-[10px] cursor-pointer"
              onClick={async () => onImport()}>
              一键导入预设{" "}
              <Icon
                icon="mdi:import"
                className=" text-[orange] w-[14px] h-[14px] ml-1"
              />
            </p>
          </div>
        </div>
      )}
      {/* E 设置模态框 */}

      {/* S 修改模态框 */}
      {showEditModel === "true" && (
        <div className="modal fixed z-[9999] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[80%] bg-[#fff] px-[10px] pb-[16px] pt-2 rounded-xl  shadow-2xl">
          <p className=" text-[14px] font-bold">删除设置</p>
          <div className="modal-content text-[10px]">
            <p className="mt-1 pb-1 text-[#818999]">
              点击列表中的删除按钮即可删除
            </p>
          </div>
          <div className="title flex items-center">
            <div className="w-[10%]">名称</div>
            <div className="w-[80%] text-center">规则</div>
            <div className="w-[10%] text-end">操作</div>
          </div>
          <div className="list overflow-y-auto h-[54%]">
            {setting.map((item, idx) => {
              return (
                <div
                  className="title flex items-center w-full flex-nowrap"
                  key={idx}>
                  <div className="w-[50px] truncate text-[teal]">
                    {item.alias}
                  </div>
                  <div className="flex-1 flex items-center overflow-x-auto">
                    <div className="w-[100px] truncate">{item.prefix}</div>
                    <div className="text-[orange] w-[28px] text-nowrap text-[7px]">
                      + 搜索值 +
                    </div>
                    <div className="w-[100px] truncate ml-2">
                      {item.suffix || "--"}
                    </div>
                  </div>
                  <div
                    onClick={() => onDelete(item.alias as string)}
                    className="w-[20px] h-[20px] rounded-full hover:bg-[#f0f0f0] flex items-center justify-center ">
                    <Icon
                      icon="mdi:delete-outline"
                      className=" text-[red] w-[14px] h-[14px] cursor-pointer"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            className="atom-button--small !w-auto !px-2 text-nowrap text-[teal] mx-[auto] mt-5"
            type="button"
            title="确定"
            onClick={() => setShowEditModel("false")}>
            确定
            <Icon
              icon="tabler:settings-star"
              className=" text-[orange] w-[14px] h-[14px] ml-1"
            />
          </button>
        </div>
      )}
      {/* E 修改模态框 */}
    </div>
  )
}

export default Content
