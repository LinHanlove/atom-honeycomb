import { Icon } from "@iconify/react"

import "~/assets/style/tailwind.css"

import { useEffect, useRef, useState } from "react"

import Modal from "~components/modal"
import Progress from "~components/progress"
import {
  Compressor_PNG,
  convertImageFormat,
  formatFileSize,
  UPNG_PNG
} from "~utils"

export default function CompressHero() {
  /**
   * @constant adjustList
   * @description 压缩率
   */
  const adjustList = [
    { value: null, label: "仅转换" },
    { value: 0.8, label: "轻度" },
    { value: 0.6, label: "一般" },
    { value: 0.4, label: "重度" }
  ]

  /**
   * @constant formatType
   * @description 格式转换
   */
  const formatTypeList = [
    { value: "png", label: "PNG" },
    { value: "webp", label: "WEBP" },
    { value: "jpeg", label: "JPEG" }
  ]

  /**
   * @useState quality
   * @description 选择的压缩率
   */
  const [quality, setQuality] = useState<number>(0.6)

  /**
   * @useState quality
   * @description 选择的压缩率
   */
  const [formatType, setFormatType] = useState<string>("png")

  /**
   * @useState fileList
   */
  const [fileList, setFileList] = useState<any[]>([])

  /**
   * @useState uploadFileRef
   */
  const uploadFileRef = useRef(null)

  /**
   * @useState isDragging
   */
  const [isDragging, setIsDragging] = useState(false)

  /**
   * @useState isOpen preview
   */
  const [isOpen, setIsOpen] = useState(false)

  /**
   * @useState isOpen format
   */
  const [isOpenFormat, setIsOpenFormat] = useState(false)

  /**
   * @useState compressor details
   */
  const [compressorDetails, setCompressorDetails] = useState<any[]>([])

  /**
   * @useState previewImage
   */
  const [previewImage, setPreviewImage] = useState<{
    original: {
      url: string
      file: any
    }
    compressed: {
      url: string
      file: any
    }
  }>({
    original: null,
    compressed: null
  })

  /**
   * @useState formatImage
   */
  const [formatImage, setFormatImage] = useState<File>()

  /**
   * @useState errorText
   */
  const [errorText, setErrorText] = useState<string>()

  /**
   * @description 监听文件列表
   */
  useEffect(() => {
    if (!fileList.length) {
      setCompressorDetails([])
    } else {
      processFiles()
    }
  }, [fileList])

  /***
   * @function processFiles
   */
  const processFiles = async () => {
    const afterData = []
    console.log("监听文件列表", fileList, quality)

    for (let index = 0; index < fileList.length; index++) {
      let fileData
      const file = fileList[index]

      if (file.status !== "success" && file.type.startsWith("image/")) {
        if (quality) {
          console.log("文件类型--->", file.type, file.type === "image/png")

          if (file.type === "image/png") {
            fileData = await UPNG_PNG(file, quality)
          } else {
            fileData = await Compressor_PNG(file, quality, window)
          }
        }
        console.log("压缩前--->", file)

        console.log("压缩后-->", fileData)
        file["status"] = "success"
        const compressibility = quality
          ? ((file.size - fileData.size) / file.size) * 100
          : 0
        afterData.push({
          id: file.id,
          file: quality ? fileData : file,
          name: file.name,
          size: quality ? fileData.size : file.size,
          type: file.type,
          key: quality ? "compress" : "convert", // 标记是否是压缩文件还是转换文件
          compressibility
        })
      }
    }

    setCompressorDetails([...afterData, ...compressorDetails])
  }

  /**
   * @function handleFileChange
   * @description 上传文件
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files).forEach((file) => {
      file["id"] = file.type.startsWith("image/")
        ? file.name.split(".")[0] + "-" + new Date().getTime()
        : null
    })

    setFileList([...fileList, ...e.target.files])
    e.target.value = ""
  }

  /**
   * @function handleDownload
   * @description 下载文件
   */
  const handleDownload = (file: any) => {
    const a = document.createElement("a")
    const downloadFile = compressorDetails.find(
      (item) => item.id === file.id
    )?.file
    a.href = URL.createObjectURL(downloadFile)
    a.download = downloadFile.name
    a.click()
  }

  /**
   * @function handleDelete
   * @description 删除文件
   */
  const handleDelete = (file: any) => {
    setFileList(fileList.filter((item) => item.id !== file.id))
    setCompressorDetails(
      compressorDetails.filter((item) => item.id !== file.id)
    )
  }

  /**
   * @function handlePreview
   * @description 预览文件
   */
  const handlePreview = (file: any) => {
    setPreviewImage({
      original: {
        url: URL.createObjectURL(file),
        file: file
      },
      compressed: {
        url: URL.createObjectURL(
          compressorDetails.find((item) => item.id === file.id)?.file
        ),
        file: compressorDetails.find((item) => item.id === file.id)?.file
      }
    })
    setIsOpen(true)
  }

  /**
   * @function handleConvertImageFormat
   * @description 转换图片格式
   * @param file 文件
   */
  const handleConvertImageFormat = async () => {
    if (formatImage.type.split("/")[1] === formatType)
      return setErrorText("格式相同，无需转换")
    const res = await convertImageFormat({
      file: formatImage,
      format: formatType
    })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(res)
    a.download = res.name
    a.click()
    setIsOpenFormat(false)
  }

  /**
   * @function handleCancel
   * @description 取消
   */
  const handleCancel = () => {}

  useEffect(() => {
    const uploadFileDom = uploadFileRef.current
    if (uploadFileDom) {
      // 拖拽文件进入
      uploadFileDom?.addEventListener("dragenter", (e) => setIsDragging(true))
      // 拖拽文件经过
      uploadFileDom?.addEventListener("dragover", (e) => setIsDragging(true))
      // 拖拽文件离开
      uploadFileDom?.addEventListener("dragleave", (e) => setIsDragging(false))
      // 拖拽文件释放
      uploadFileDom?.addEventListener("drop", (e) => setIsDragging(false))
    }

    console.log(uploadFileDom)
    return () => {
      if (uploadFileDom) {
        uploadFileDom?.removeEventListener("dragenter")
        uploadFileDom?.removeEventListener("dragover")
        uploadFileDom?.removeEventListener("dragleave")
        uploadFileDom?.removeEventListener("drop")
      }
    }
  }, [])

  /**
   * @function isConvert
   */
  const isConvert = (file) => {
    return compressorDetails.find((i) => i.id === file.id)?.key === "convert"
  }
  return (
    <>
      <h2 className="title text-center text-2xl font-bold py-4">
        CompressHero
      </h2>
      <div className="subTitle mx-4  text-[12px] font-semibold flex ">
        <div className="mb-1 ">
          支持PNG、JPEG、GIF、WEBP图片进行智能有损压缩、预览、格式转换；如只转换格式，则请勾选仅转换
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
      <div className="container mx-[auto] mt-4 h-[80vh] overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
        {/* S 调节区 */}
        <div className="flex justify-start">
          <div className="flex items-center mb-4 bg-[#f5f5f5] p-1 rounded-lg">
            {adjustList.map((item, idx) => {
              return (
                <div
                  style={{
                    backgroundColor:
                      item.value === quality ? "orange" : "#f5f5f5"
                  }}
                  onClick={() => setQuality(item.value)}
                  className={`${idx === adjustList.length - 1 ? "" : "mr-2"} w-[60px] h-[26px] flex items-center justify-center rounded-lg  cursor-pointer hover:bg-[#e0e0e0] transition-all`}
                  key={item.value}>
                  <div className="flex items-center ">{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>
        {/* E 调节区 */}

        {/* S 上传区 */}
        <div className="content flex items-start justify-center ">
          <div className="flex justify-center">
            <label
              id="uploadFileDom"
              ref={uploadFileRef}
              htmlFor="file"
              className={`w-[384px] h-[160px] group relative border-2 border-dashed  rounded-lg flex flex-col items-center justify-center cursor-pointer ${isDragging ? "border-[orange] bg-[#f5f5f5]" : "border-gray-300"}`}>
              <input
                type="file"
                accept="image/*"
                multiple
                id="file"
                className=" opacity-0 w-full h-full absolute top-0 left-0 "
                onChange={handleFileChange}
              />
              <Icon
                icon="si:add-fill"
                className={`w-[20px] h-[20px] text-[orange] mb-2 group-hover:scale-150 transition-all duration-300 ${isDragging && "scale-150"}`}
              />
              <div
                className={`text-[#666] text-[14px] font-semibold group-hover:scale-[1.2] transition-all duration-300 ${isDragging && "scale-[1.2]"}`}>
                点击或拖拽图片文件到此处
              </div>
            </label>
          </div>
        </div>
        {/* E 上传区 */}

        {/* S 展示区 */}
        <div className=" mt-4 flex justify-center items-center flex-col ">
          {fileList.map((item) => (
            <div
              key={item.name}
              className="flex items-end justify-between w-[calc(70vw-120px)] h-[46px]">
              <div className="mt-2 w-[66vw] ">
                <div className="w-[60%] truncate">{item.name}</div>
                {item.id ? (
                  <Progress
                    beforeText={formatFileSize(item.size)}
                    afterText={
                      compressorDetails.find((i) => i.id === item.id)?.key ===
                      "compress"
                        ? formatFileSize(
                            compressorDetails.find((i) => i.id === item.id)
                              ?.size
                          )
                        : ""
                    }
                    progress={
                      compressorDetails.find((i) => i.id === item.id)?.key ===
                      "compress"
                        ? compressorDetails.find((i) => i.id === item.id)
                            ?.compressibility
                        : null
                    }
                  />
                ) : (
                  <Progress
                    isContent={false}
                    beforeText="File type is not supported"
                    backgroundColor="#eb4545"
                  />
                )}
              </div>
              {item.id && (
                <div className="h-full w-auto flex items-end justify-center gap-2 ml-2">
                  {/* S 预览 */}
                  {!isConvert(item) && (
                    <div
                      onClick={() => handlePreview(item)}
                      className="h-full group flex items-end justify-center mr-2">
                      <Icon
                        icon="ri:eye-line"
                        className="w-[20px] h-[20px] rounded-full  text-green-500 group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
                      />
                    </div>
                  )}

                  {/* E 预览 */}

                  {/* S 删除 */}
                  <div
                    onClick={() => handleDelete(item)}
                    className="h-full group flex items-end  justify-center mr-2">
                    <Icon
                      icon="mdi:delete-outline"
                      className="w-[20px] h-[20px] rounded-full  text-red-500 group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
                    />
                  </div>
                  {/* S 删除 */}

                  {/* S 下载 */}
                  <div
                    onClick={() => handleDownload(item)}
                    className="h-full group flex items-end  justify-center mr-2">
                    <Icon
                      icon="line-md:download-loop"
                      className="w-[20px] h-[20px] rounded-full  text-[orange] group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
                    />
                  </div>
                  {/* S 下载 */}

                  {/* S 格式转换 */}
                  {isConvert(item) && (
                    <div
                      onClick={() => {
                        setFormatImage(item)
                        setIsOpenFormat(true)
                      }}
                      className="h-full group flex items-end  justify-center mr-2">
                      <Icon
                        icon="icon-park-outline:file-conversion-one"
                        className="w-[20px] h-[20px] rounded-full  text-[#2d9cf4] group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
                      />
                    </div>
                  )}

                  {/* E 格式转换 */}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* S 展示区 */}
      </div>

      {/* S 预览弹窗 */}
      <Modal
        isOpen={isOpen}
        setIsOpen={(fisOpen) => setIsOpen(fisOpen)}
        onConfirm={handlePreview}
        onCancel={handleCancel}
        title="对比预览">
        <div className="flex justify-center items-center w-[70vw]">
          <div className="w-1/2  border-r-2 border-[#2d9cf4] flex justify-center items-center flex-col">
            <div className=" text-[#666] text-[14px] font-semibold mb-3">
              压缩前{" "}
              <span className="text-red-500">
                ({formatFileSize(previewImage.original?.file.size)})
              </span>
            </div>
            <img
              className="w-full h-[60vh] "
              src={previewImage.original?.url}
              alt=""
            />
          </div>
          <div className="w-1/2 flex justify-center items-center flex-col">
            <div className=" text-[#666] text-[14px] font-semibold mb-3">
              压缩后{" "}
              <span className="text-green-500">
                ({formatFileSize(previewImage.compressed?.file.size)})
              </span>
            </div>
            <img
              className="w-full h-[60vh] "
              src={previewImage.compressed?.url}
              alt=""
            />
          </div>
        </div>
      </Modal>
      {/* E 预览弹窗 */}

      {/* S format弹窗 */}
      <Modal
        isOpen={isOpenFormat}
        setIsOpen={(isOpenFormat) => setIsOpenFormat(isOpenFormat)}
        hasConfirm
        confirmText="下载"
        onConfirm={handleConvertImageFormat}
        onCancel={handleCancel}
        title="格式转换">
        <div className="w-[50vw] flex justify-center items-center flex-col">
          <div className=" text-[#666] text-[14px] font-semibold mb-3 flex items-center">
            <span> 转换前</span>
            <span className="text-red-500 ">({formatImage?.type})</span>
            <Icon
              icon="eos-icons:arrow-rotate"
              className=" text-[orange] w-[20px] h-[20px] mx-4"
            />
            <span>转换为</span>
            <span className="text-green-500">(imgae/{formatType})</span>
          </div>
          <p className="text-[#666] text-[14px] font-semibold mb-3">
            {errorText}
          </p>
          <div className="flex justify-start mt-5">
            <div className="flex items-center mb-4 bg-[#f5f5f5] p-1 rounded-lg">
              {formatTypeList.map((item, idx) => {
                return (
                  <div
                    style={{
                      backgroundColor:
                        item.value === formatType ? "orange" : "#f5f5f5"
                    }}
                    onClick={() => setFormatType(item.value)}
                    className={`${idx === formatTypeList.length - 1 ? "" : "mr-2"} w-[60px] h-[26px] flex items-center justify-center rounded-lg  cursor-pointer hover:bg-[#e0e0e0] transition-all`}
                    key={item.value}>
                    <div className="flex items-center ">{item.label}</div>
                  </div>
                )
              })}
            </div>
            {/* E 调节区 */}
          </div>
        </div>
      </Modal>
      {/* E format弹窗 */}
    </>
  )
}
