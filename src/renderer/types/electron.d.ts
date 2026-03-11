declare global {
  interface Window {
    electronAPI: {
      saveScreenshots: (captures: Array<{ filename: string; buffer: number[] }>) => Promise<void>
      notifyScroll: (deviceId: string, ratio: number) => void
      getLanIp: () => Promise<string | null>
    }
    __preloadPath: string
    __programmaticScroll: boolean
  }
}

export {}
