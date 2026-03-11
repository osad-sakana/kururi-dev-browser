const HEADER_HEIGHT = 36
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const BG_COLOR = '#1e293b'
const TEXT_COLOR = '#f1f5f9'
const SUB_COLOR = '#94a3b8'

/**
 * PNG バッファ画像の上部にデバイス名・URL・日時バーを合成して返す
 */
export async function addCaptureHeader(
  pngBuffer: Uint8Array,
  deviceName: string,
  width: number,
  height: number,
  url: string,
  capturedAt: Date
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([pngBuffer], { type: 'image/png' })
    const objectUrl = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const totalHeight = HEADER_HEIGHT + img.height
      canvas.width = img.width
      canvas.height = totalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Canvas context unavailable'))
        return
      }

      // ヘッダー背景
      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, canvas.width, HEADER_HEIGHT)

      // デバイス名（左）
      ctx.font = `bold 13px ${FONT_FAMILY}`
      ctx.fillStyle = TEXT_COLOR
      ctx.textBaseline = 'middle'
      ctx.fillText(`${deviceName}  ${width}×${height}`, 12, HEADER_HEIGHT / 2)

      // URL（中央付近）
      const dateStr = capturedAt
        .toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

      ctx.font = `11px ${FONT_FAMILY}`
      ctx.fillStyle = SUB_COLOR
      const maxUrlWidth = canvas.width - 260
      const truncatedUrl = truncateMiddle(url, ctx, maxUrlWidth)
      ctx.fillText(truncatedUrl, 200, HEADER_HEIGHT / 2)

      // 日時（右端）
      const dateWidth = ctx.measureText(dateStr).width
      ctx.fillStyle = SUB_COLOR
      ctx.fillText(dateStr, canvas.width - dateWidth - 12, HEADER_HEIGHT / 2)

      // 元画像を下に描画
      ctx.drawImage(img, 0, HEADER_HEIGHT)

      URL.revokeObjectURL(objectUrl)

      canvas.toBlob((resultBlob) => {
        if (!resultBlob) {
          reject(new Error('Canvas toBlob failed'))
          return
        }
        resultBlob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject)
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image load failed'))
    }

    img.src = objectUrl
  })
}

function truncateMiddle(text: string, ctx: CanvasRenderingContext2D, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  const ellipsis = '...'
  let left = 0
  let right = text.length
  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    const truncated = text.slice(0, mid) + ellipsis
    if (ctx.measureText(truncated).width <= maxWidth) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  return text.slice(0, left - 1) + ellipsis
}
