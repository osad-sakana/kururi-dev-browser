import { ipcRenderer } from 'electron'
import {
  APPLY_SCROLL_ANCHOR_CHANNEL,
  SCROLL_ANCHOR_CHANNEL,
  type ScrollAnchor,
} from '../shared/scrollAnchor'
import { applyAnchor, computeAnchor } from './scrollAnchor'

// プログラムによるスクロールで再送しないための抑制期間(ms)
const SUPPRESS_MS = 150

let suppressUntil = 0
let frameRequested = false

window.addEventListener(
  'scroll',
  () => {
    if (performance.now() < suppressUntil || frameRequested) return
    frameRequested = true
    requestAnimationFrame(() => {
      frameRequested = false
      ipcRenderer.sendToHost(SCROLL_ANCHOR_CHANNEL, computeAnchor(window))
    })
  },
  { passive: true }
)

ipcRenderer.on(APPLY_SCROLL_ANCHOR_CHANNEL, (_event, anchor: ScrollAnchor) => {
  suppressUntil = performance.now() + SUPPRESS_MS
  applyAnchor(window, anchor)
})
