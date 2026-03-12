import { useCallback, useRef } from 'react'
import { Viewport } from '../types/device'
import { ViewportPanel } from './ViewportPanel'

interface ViewportContainerProps {
  viewports: Viewport[]
  currentUrl: string
  onWebviewsChange: (webviews: Map<string, Electron.WebviewTag>) => void
  onLoadingChange: (deviceId: string, isLoading: boolean) => void
  onCloseDevice: (deviceId: string) => void
  scale: number
}

export function ViewportContainer({
  viewports,
  currentUrl,
  onWebviewsChange,
  onLoadingChange,
  onCloseDevice,
  scale,
}: ViewportContainerProps) {
  const webviewMapRef = useRef<Map<string, Electron.WebviewTag>>(new Map())

  const handleWebviewReady = useCallback(
    (deviceId: string, webview: Electron.WebviewTag) => {
      webviewMapRef.current = new Map(webviewMapRef.current).set(deviceId, webview)
      onWebviewsChange(new Map(webviewMapRef.current))
    },
    [onWebviewsChange]
  )

  const handleWebviewRemove = useCallback(
    (deviceId: string) => {
      const next = new Map(webviewMapRef.current)
      next.delete(deviceId)
      webviewMapRef.current = next
      onWebviewsChange(new Map(next))
    },
    [onWebviewsChange]
  )

  if (viewports.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>デバイスを選択してください</p>
      </div>
    )
  }

  if (!currentUrl) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <p className="text-lg">URLを入力してください</p>
          <p className="text-sm mt-1 text-gray-600">複数デバイスで同時プレビューできます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <div className="flex gap-4 p-4 items-start" style={{ minWidth: 'max-content' }}>
        {viewports.map((viewport) => (
          <ViewportPanel
            key={`${viewport.device.id}-${currentUrl}`}
            device={viewport.device}
            url={currentUrl}
            onWebviewReady={handleWebviewReady}
            onWebviewRemove={handleWebviewRemove}
            onLoadingChange={onLoadingChange}
            onClose={onCloseDevice}
            scale={scale}
          />
        ))}
      </div>
    </div>
  )
}
