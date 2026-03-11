import { ipcMain } from 'electron'
import { saveScreenshots } from './screenshot'

export function registerIpcHandlers(): void {
  ipcMain.handle(
    'save-screenshots',
    async (_event, captures: Array<{ filename: string; buffer: number[] }>) => {
      await saveScreenshots(captures)
    }
  )
}
