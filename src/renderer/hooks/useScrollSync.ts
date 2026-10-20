import { useCallback, useState } from 'react'
import { APPLY_SCROLL_ANCHOR_CHANNEL, type ScrollAnchor } from '../../shared/scrollAnchor'

export function useScrollSync(webviewMapRef: React.MutableRefObject<Map<string, Electron.WebviewTag>>) {
  const [isEnabled, setIsEnabled] = useState(true)

  const toggleScrollSync = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  const handleAnchorFrom = useCallback(
    (sourceDeviceId: string, anchor: ScrollAnchor) => {
      if (!isEnabled) return
      webviewMapRef.current.forEach((webview, deviceId) => {
        if (deviceId === sourceDeviceId) return
        try {
          webview.send(APPLY_SCROLL_ANCHOR_CHANNEL, anchor)
        } catch {}
      })
    },
    [isEnabled, webviewMapRef]
  )

  return { isEnabled, toggleScrollSync, handleAnchorFrom }
}
