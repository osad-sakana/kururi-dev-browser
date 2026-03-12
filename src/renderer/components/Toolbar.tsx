const SCALE_OPTIONS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0 },
  { label: '125%', value: 1.25 },
]

interface ToolbarProps {
  onCaptureAll: () => void
  isCapturing: boolean
  scale: number
  onScaleChange: (scale: number) => void
}

export function Toolbar({
  onCaptureAll,
  isCapturing,
  scale,
  onScaleChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <button
          onClick={() => {
            const idx = SCALE_OPTIONS.findIndex((o) => o.value === scale)
            if (idx > 0) onScaleChange(SCALE_OPTIONS[idx - 1].value)
          }}
          disabled={scale <= SCALE_OPTIONS[0].value}
          className="px-1.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="縮小"
        >
          −
        </button>
        <select
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {SCALE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const idx = SCALE_OPTIONS.findIndex((o) => o.value === scale)
            if (idx < SCALE_OPTIONS.length - 1) onScaleChange(SCALE_OPTIONS[idx + 1].value)
          }}
          disabled={scale >= SCALE_OPTIONS[SCALE_OPTIONS.length - 1].value}
          className="px-1.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="拡大"
        >
          ＋
        </button>
      </div>

      <button
        onClick={onCaptureAll}
        disabled={isCapturing}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="全ビューポートをキャプチャ"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {isCapturing ? 'キャプチャ中...' : 'スクリーンショット'}
      </button>
    </div>
  )
}
