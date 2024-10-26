export default function Progress(option) {
  const {
    beforeText,
    afterText,
    progress,
    height = "20px",
    width = "100%",
    backgroundColor,
    isContent = true
  } = option

  return (
    <div
      style={{ height, width }}
      className="progress relative  rounded-[10px]  overflow-hidden">
      <div className="progress-back w-full h-full px-2  bg-[#E0E0E0]  flex justify-between items-center">
        <div
          style={{ color: backgroundColor ? "#fff" : "#000" }}
          className="progress-before  text-[10px]  z-20">
          {beforeText}
        </div>
        {isContent ? (
          progress && progress.toFixed(2) > 0.01 ? (
            <div className="progress-before  text-[10px] text-[#000] z-20">
              <span className="text-[red]">-</span>
              <span className="duration-[1100ms] ease-linear">
                {progress.toFixed(2)}%
              </span>
            </div>
          ) : (
            <div className="progress-before  text-[10px] text-[#000] z-20">
              {progress !== null ? "已经很小啦！试试重度压缩" : ""}
            </div>
          )
        ) : null}

        <div className=" progress-after  text-[10px] text-[#000] z-20">
          {afterText}
        </div>
      </div>
      <div
        style={{
          width: `${progress || 100}%`,
          backgroundColor: `${backgroundColor ? backgroundColor : progress ? "#92ed14" : "#E0E0E0"}`
        }}
        className="progress-bar z-10 absolute left-0 top-0  duration-[1100ms] ease-linear  h-full  rounded-[10px]"></div>
    </div>
  )
}
