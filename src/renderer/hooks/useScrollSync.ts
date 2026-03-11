import { useState, useCallback, useRef } from 'react'

export function useScrollSync() {
  const [isEnabled, setIsEnabled] = useState(false)
  const isSyncingRef = useRef(false)

  const toggleScrollSync = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  const handleScrollFrom = useCallback(
    (sourceDeviceId: string, scrollRatio: number, webviewRefs: Map<string, Electron.WebviewTag>) => {
      if (!isEnabled || isSyncingRef.current) return

      isSyncingRef.current = true

      webviewRefs.forEach((webview, deviceId) => {
        if (deviceId === sourceDeviceId) return
        webview.executeJavaScript(`
          (function() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
              window.__programmaticScroll = true;
              window.scrollTo(0, maxScroll * ${scrollRatio});
              setTimeout(() => { window.__programmaticScroll = false; }, 100);
            }
          })()
        `).catch(() => {})
      })

      setTimeout(() => {
        isSyncingRef.current = false
      }, 150)
    },
    [isEnabled]
  )

  return {
    isEnabled,
    toggleScrollSync,
    handleScrollFrom,
  }
}
