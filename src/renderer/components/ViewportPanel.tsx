import { useRef, useEffect, useCallback } from 'react'
import { DevicePreset } from '../types/device'

interface ViewportPanelProps {
  device: DevicePreset
  url: string
  isScrollSyncEnabled: boolean
  onScrollChange: (deviceId: string, ratio: number) => void
  onWebviewReady: (deviceId: string, webview: Electron.WebviewTag) => void
  onWebviewRemove: (deviceId: string) => void
  onLoadingChange: (deviceId: string, isLoading: boolean) => void
}

export function ViewportPanel({
  device,
  url,
  isScrollSyncEnabled,
  onScrollChange,
  onWebviewReady,
  onWebviewRemove,
  onLoadingChange,
}: ViewportPanelProps) {
  const webviewRef = useRef<Electron.WebviewTag>(null)
  const deviceIdRef = useRef(device.id)

  const handleScroll = useCallback(
    (ratio: number) => {
      onScrollChange(device.id, ratio)
    },
    [device.id, onScrollChange]
  )

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    const onReady = () => {
      onWebviewReady(device.id, webview)
    }

    const onLoadStart = () => onLoadingChange(device.id, true)
    const onLoadStop = () => {
      onLoadingChange(device.id, false)
      if (isScrollSyncEnabled) {
        webview
          .executeJavaScript(`
          window.__kururiDeviceId = '${device.id}';
          (function() {
            if (window.__kururiScrollListener) return;
            window.__kururiScrollListener = true;
            window.addEventListener('scroll', function() {
              if (window.__programmaticScroll) return;
              const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
              if (maxScroll > 0) {
                const ratio = window.scrollY / maxScroll;
                window.electronAPI && window.electronAPI.notifyScroll('${device.id}', ratio);
              }
            }, { passive: true });
          })();
        `)
          .catch(() => {})
      }
    }

    webview.addEventListener('dom-ready', onReady)
    webview.addEventListener('did-start-loading', onLoadStart)
    webview.addEventListener('did-stop-loading', onLoadStop)

    return () => {
      webview.removeEventListener('dom-ready', onReady)
      webview.removeEventListener('did-start-loading', onLoadStart)
      webview.removeEventListener('did-stop-loading', onLoadStop)
      onWebviewRemove(deviceIdRef.current)
    }
  }, [device.id, isScrollSyncEnabled, onWebviewReady, onWebviewRemove, onLoadingChange, handleScroll])

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview || !url) return
    if (webview.src !== url) {
      webview.src = url
    }
  }, [url])

  const scale = 0.75
  const scaledWidth = Math.round(device.width * scale)
  const scaledHeight = Math.round(Math.min(device.height, 800) * scale)

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <span className="text-gray-200 text-xs font-medium">{device.name}</span>
        <span className="text-gray-500 text-xs">
          {device.width} × {device.height}
        </span>
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
          preload={`file://${window.__preloadPath || ''}`}
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
