import { Icon } from "@iconify/react"
import React from "react"

export default function Modal({
  children,
  onConfirm,
  onCancel,
  isOpen,
  title,
  setIsOpen,
  hasConfirm = false,
  hasCancel = false,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-end items-center">
              <Icon
                onClick={() => setIsOpen(false)}
                icon="line-md:cancel-twotone"
                className="w-[20px] h-[20px] rounded-full  text-[orange] group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
              />
            </div>

            <div className="text-[#333] text-[20px] font-semibold mb-4 text-center">
              {title}
            </div>
            <div className="mt-4">{children}</div>

            {hasCancel ||
              (hasConfirm && (
                <div className="mt-6 flex items-center justify-end space-x-4">
                  {hasCancel && (
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => onCancel()}>
                      {cancelText}
                    </button>
                  )}
                  {hasConfirm && (
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => onConfirm()}>
                      {confirmText}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}
