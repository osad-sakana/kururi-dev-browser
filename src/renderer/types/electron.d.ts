declare global {
  interface Window {
    electronAPI: {
      saveScreenshots: (captures: Array<{ filename: string; buffer: number[] }>) => Promise<void>
      getLanIp: () => Promise<string | null>
    }
  }
}

export {}
