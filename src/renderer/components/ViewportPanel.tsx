import { useCallback, useEffect, useRef } from 'react'
import { DevicePreset } from '../types/device'

interface ViewportPanelProps {
  device: DevicePreset
  url: string
  onWebviewReady: (deviceId: string, webview: Electron.WebviewTag) => void
  onWebviewRemove: (deviceId: string) => void
  onLoadingChange: (deviceId: string, isLoading: boolean) => void
  onClose: (deviceId: string) => void
  scale: number
}

export function ViewportPanel({
  device,
  url,
  onWebviewReady,
  onWebviewRemove,
  onLoadingChange,
  onClose,
  scale,
}: ViewportPanelProps) {
  const webviewRef = useRef<Electron.WebviewTag>(null)
  const deviceIdRef = useRef(device.id)

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    const onReady = () => onWebviewReady(device.id, webview)
    const onLoadStart = () => onLoadingChange(device.id, true)
    const onLoadStop = () => onLoadingChange(device.id, false)

    webview.addEventListener('dom-ready', onReady)
    webview.addEventListener('did-start-loading', onLoadStart)
    webview.addEventListener('did-stop-loading', onLoadStop)

    return () => {
      webview.removeEventListener('dom-ready', onReady)
      webview.removeEventListener('did-start-loading', onLoadStart)
      webview.removeEventListener('did-stop-loading', onLoadStop)
      onWebviewRemove(deviceIdRef.current)
    }
  }, [device.id, onWebviewReady, onWebviewRemove, onLoadingChange])

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview || !url) return
    if (webview.src !== url) {
      webview.src = url
    }
  }, [url])

  const scaledWidth = Math.round(device.width * scale)
  const scaledHeight = Math.round(Math.min(device.height, 800) * scale)

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <span className="text-gray-200 text-xs font-medium">{device.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {device.width} × {device.height}
          </span>
          <button
            onClick={() => onClose(device.id)}
            className="text-gray-500 hover:text-gray-200 transition-colors leading-none"
            title="閉じる"
          >
            ×
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        {/* @ts-expect-error webview is an Electron-specific element */}
        <webview
          ref={webviewRef}
          src={url || 'about:blank'}
          useragent={device.userAgent}
          webpreferences="contextIsolation=true"
          style={{
            width: device.width,
            height: Math.min(device.height, 800),
            display: 'inline-flex',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  )
}
