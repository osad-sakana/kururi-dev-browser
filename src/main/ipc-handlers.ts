import { ipcMain } from 'electron'
import { networkInterfaces } from 'os'
import { saveScreenshots } from './screenshot'

function getLanIp(): string | null {
  const nets = networkInterfaces()
  for (const iface of Object.values(nets)) {
    if (!iface) continue
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return null
}

export function registerIpcHandlers(): void {
  ipcMain.handle(
    'save-screenshots',
    async (_event, captures: Array<{ filename: string; buffer: number[] }>) => {
      await saveScreenshots(captures)
    }
  )

  ipcMain.handle('get-lan-ip', () => getLanIp())
}
