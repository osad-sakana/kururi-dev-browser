import { dialog } from 'electron'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function saveScreenshots(
  captures: Array<{ filename: string; buffer: number[] }>
): Promise<void> {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'スクリーンショットの保存先を選択',
    properties: ['openDirectory', 'createDirectory'],
  })

  if (canceled || filePaths.length === 0) return

  const saveDir = filePaths[0]

  await Promise.all(
    captures.map(async ({ filename, buffer }) => {
      const filePath = join(saveDir, filename)
      await writeFile(filePath, Buffer.from(buffer))
    })
  )
}
