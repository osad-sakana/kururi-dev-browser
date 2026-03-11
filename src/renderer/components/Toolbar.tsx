interface ToolbarProps {
  isScrollSyncEnabled: boolean
  onToggleScrollSync: () => void
  onCaptureAll: () => void
  isCapturing: boolean
}

export function Toolbar({
  isScrollSyncEnabled,
  onToggleScrollSync,
  onCaptureAll,
  isCapturing,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleScrollSync}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
          isScrollSyncEnabled
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
        title="スクロール同期"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        スクロール同期 {isScrollSyncEnabled ? 'ON' : 'OFF'}
      </button>

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
