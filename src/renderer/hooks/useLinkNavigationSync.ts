import { useCallback } from 'react'

/**
 * あるデバイスでリンクを踏んだ時、他のデバイスも同じURLへ遷移させる。
 * will-navigate は loadURL や戻る/進むでは発火しないため、ループしない。
 */
export function useLinkNavigationSync(
  webviewMapRef: React.MutableRefObject<Map<string, Electron.WebviewTag>>
) {
  return useCallback(
    (sourceDeviceId: string, url: string) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) return
      webviewMapRef.current.forEach((webview, deviceId) => {
        if (deviceId === sourceDeviceId) return
        try {
          webview.loadURL(url).catch(() => {})
        } catch {}
      })
    },
    [webviewMapRef]
  )
}
