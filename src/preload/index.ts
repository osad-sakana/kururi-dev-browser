import { contextBridge, ipcRenderer } from 'electron'

declare global {
  interface Window {
    electronAPI: {
      saveScreenshots: (captures: Array<{ filename: string; buffer: number[] }>) => Promise<void>
      getLanIp: () => Promise<string | null>
    }
    __programmaticScroll: boolean
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveScreenshots: (captures: Array<{ filename: string; buffer: number[] }>) =>
    ipcRenderer.invoke('save-screenshots', captures),
  getLanIp: () => ipcRenderer.invoke('get-lan-ip'),
})
