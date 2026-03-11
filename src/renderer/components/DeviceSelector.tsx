import { useState, FormEvent } from 'react'
import { DevicePreset } from '../types/device'

interface DeviceSelectorProps {
  allDevices: DevicePreset[]
  selectedDeviceIds: string[]
  onToggleDevice: (deviceId: string) => void
  onAddCustomDevice: (name: string, width: number, height: number) => void
}

export function DeviceSelector({
  allDevices,
  selectedDeviceIds,
  onToggleDevice,
  onAddCustomDevice,
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')

  const handleAddCustom = (e: FormEvent) => {
    e.preventDefault()
    const width = parseInt(customWidth)
    const height = parseInt(customHeight)
    if (!customName.trim() || isNaN(width) || isNaN(height) || width < 1 || height < 1) return

    onAddCustomDevice(customName.trim(), width, height)
    setCustomName('')
    setCustomWidth('')
    setCustomHeight('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        デバイス ({selectedDeviceIds.length})
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <div className="p-3">
            <p className="text-xs text-gray-400 mb-2">デバイスを選択（最大6台）</p>
            <div className="space-y-1">
              {allDevices.map((device) => {
                const isSelected = selectedDeviceIds.includes(device.id)
                const isDisabled = !isSelected && selectedDeviceIds.length >= 6
                return (
                  <label
                    key={device.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => onToggleDevice(device.id)}
                      className="w-3.5 h-3.5 accent-blue-500"
                    />
                    <span className="text-gray-200 text-sm">{device.name}</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {device.width}×{device.height}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="mt-3 border-t border-gray-700 pt-3">
              <p className="text-xs text-gray-400 mb-2">カスタムサイズを追加</p>
              <form onSubmit={handleAddCustom} className="space-y-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="デバイス名"
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="幅"
                    min="1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-400 text-xs self-center">×</span>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="高さ"
                    min="1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                >
                  追加
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
