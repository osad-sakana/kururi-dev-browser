import { useCallback, useRef, useState } from 'react'
import { URLBar } from './components/URLBar'
import { ViewportContainer } from './components/ViewportContainer'
import { DeviceSelector } from './components/DeviceSelector'
import { Toolbar } from './components/Toolbar'
import { useViewports } from './hooks/useViewports'
import { useScrollSync } from './hooks/useScrollSync'
import { addCaptureHeader } from './utils/captureUtils'

export function App() {
  const {
    allDevices,
    selectedDeviceIds,
    activeViewports,
    currentUrl,
    setCurrentUrl,
    toggleDevice,
    addCustomDevice,
    setViewportLoading,
  } = useViewports()

  const { isEnabled: isScrollSyncEnabled, toggleScrollSync, handleScrollFrom } = useScrollSync()
  const webviewMapRef = useRef<Map<string, Electron.WebviewTag>>(new Map())
  const [isCapturing, setIsCapturing] = useState(false)

  const handleNavigate = useCallback(
    (url: string) => {
      setCurrentUrl(url)
    },
    [setCurrentUrl]
  )

  const handleBack = useCallback(() => {
    webviewMapRef.current.forEach((webview) => {
      try {
        webview.goBack()
      } catch {}
    })
  }, [])

  const handleForward = useCallback(() => {
    webviewMapRef.current.forEach((webview) => {
      try {
        webview.goForward()
      } catch {}
    })
  }, [])

  const handleReload = useCallback(() => {
    webviewMapRef.current.forEach((webview) => {
      try {
        webview.reload()
      } catch {}
    })
  }, [])

  const handleWebviewsChange = useCallback((webviews: Map<string, Electron.WebviewTag>) => {
    webviewMapRef.current = webviews
  }, [])

  const handleScrollChange = useCallback(
    (sourceDeviceId: string, ratio: number) => {
      handleScrollFrom(sourceDeviceId, ratio, webviewMapRef.current)
    },
    [handleScrollFrom]
  )

  const handleCaptureAll = useCallback(async () => {
    if (!currentUrl || webviewMapRef.current.size === 0) return
    setIsCapturing(true)

    try {
      const urlObj = new URL(currentUrl)
      const host = urlObj.hostname.replace(/\./g, '_')
      const now = new Date()
      const timestamp = now
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19)

      const captures: Array<{ deviceId: string; buffer: Uint8Array }> = []

      for (const [deviceId, webview] of webviewMapRef.current.entries()) {
        try {
          const image = await webview.capturePage()
          const rawBuffer = image.toPNG()
          const device = allDevices.find((d) => d.id === deviceId)
          const composited = await addCaptureHeader(
            rawBuffer,
            device?.name ?? deviceId,
            device?.width ?? 0,
            device?.height ?? 0,
            currentUrl,
            now
          )
          captures.push({ deviceId, buffer: composited })
        } catch (err) {
          console.error(`Failed to capture ${deviceId}:`, err)
        }
      }

      if (captures.length > 0 && window.electronAPI) {
        const captureData = captures.map(({ deviceId, buffer }) => {
          const device = allDevices.find((d) => d.id === deviceId)
          const deviceName = device?.name ?? deviceId
          const width = device?.width ?? 0
          const height = device?.height ?? 0
          const filename = `${host}_${deviceName}_${width}x${height}_${timestamp}.png`
          return { filename, buffer: Array.from(buffer) }
        })

        await window.electronAPI.saveScreenshots(captureData)
      }
    } catch (err) {
      console.error('Screenshot failed:', err)
    } finally {
      setIsCapturing(false)
    }
  }, [currentUrl, allDevices])

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <URLBar
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        currentUrl={currentUrl}
      />

      <div className="flex items-center gap-3 px-3 py-2 bg-gray-850 border-b border-gray-700 bg-gray-900">
        <DeviceSelector
          allDevices={allDevices}
          selectedDeviceIds={selectedDeviceIds}
          onToggleDevice={toggleDevice}
          onAddCustomDevice={addCustomDevice}
        />
        <Toolbar
          isScrollSyncEnabled={isScrollSyncEnabled}
          onToggleScrollSync={toggleScrollSync}
          onCaptureAll={handleCaptureAll}
          isCapturing={isCapturing}
        />
      </div>

      <ViewportContainer
        viewports={activeViewports}
        currentUrl={currentUrl}
        isScrollSyncEnabled={isScrollSyncEnabled}
        onScrollChange={handleScrollChange}
        onWebviewsChange={handleWebviewsChange}
        onLoadingChange={setViewportLoading}
      />
    </div>
  )
}
