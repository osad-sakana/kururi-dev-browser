import { useState, KeyboardEvent, FormEvent, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface URLBarProps {
  onNavigate: (url: string) => void
  onBack: () => void
  onForward: () => void
  onReload: () => void
  currentUrl: string
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`
}

export function URLBar({ onNavigate, onBack, onForward, onReload, currentUrl }: URLBarProps) {
  const [inputValue, setInputValue] = useState(currentUrl)
  const [showQr, setShowQr] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrDisplayUrl, setQrDisplayUrl] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const url = normalizeUrl(inputValue)
    if (url) {
      setInputValue(url)
      onNavigate(url)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setInputValue(currentUrl)
      setShowQr(false)
    }
  }

  const resolveQrUrl = async (url: string): Promise<string> => {
    try {
      const parsed = new URL(url)
      const isLocalhost =
        parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
      if (isLocalhost && window.electronAPI) {
        const lanIp = await window.electronAPI.getLanIp()
        if (lanIp) {
          parsed.hostname = lanIp
          return parsed.toString()
        }
      }
    } catch {}
    return url
  }

  const handleToggleQr = async () => {
    if (!currentUrl) return
    if (!showQr) {
      try {
        const qrUrl = await resolveQrUrl(currentUrl)
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          width: 200,
          margin: 2,
          color: { dark: '#0f172a', light: '#f8fafc' },
        })
        setQrDataUrl(dataUrl)
        setQrDisplayUrl(qrUrl)
      } catch {}
    }
    setShowQr((prev) => !prev)
  }

  // QRポップアップ外クリックで閉じる
  useEffect(() => {
    if (!showQr) return
    const handler = (e: MouseEvent) => {
      if (qrRef.current && !qrRef.current.contains(e.target as Node)) {
        setShowQr(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showQr])

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="戻る"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onForward}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="進む"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={onReload}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="リロード"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          placeholder="URLを入力 (例: example.com)"
          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </form>

      {/* QRコードボタン */}
      <div className="relative" ref={qrRef}>
        <button
          onClick={handleToggleQr}
          disabled={!currentUrl}
          className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
            showQr
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700 text-gray-400 hover:text-white'
          }`}
          title="QRコードで実機確認"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </button>

        {showQr && qrDataUrl && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
            <p className="text-gray-400 text-xs mb-2 text-center">実機で確認</p>
            <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 rounded" />
            {qrDisplayUrl !== currentUrl && (
              <p className="text-blue-400 text-xs mt-1.5 text-center">LAN IPに変換済み</p>
            )}
            <p className="text-gray-500 text-xs mt-1 text-center max-w-[160px] break-all leading-tight">
              {qrDisplayUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
