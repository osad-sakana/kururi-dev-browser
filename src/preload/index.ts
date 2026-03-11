import { contextBridge, ipcRenderer } from 'electron'

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

contextBridge.exposeInMainWorld('electronAPI', {
  saveScreenshots: (captures: Array<{ filename: string; buffer: number[] }>) =>
    ipcRenderer.invoke('save-screenshots', captures),
  notifyScroll: (deviceId: string, ratio: number) =>
    ipcRenderer.send('scroll-sync', { deviceId, ratio }),
  getLanIp: () => ipcRenderer.invoke('get-lan-ip'),
})
