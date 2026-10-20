import { ipcRenderer } from 'electron'
import {
  APPLY_SCROLL_ANCHOR_CHANNEL,
  SCROLL_ANCHOR_CHANNEL,
  type ScrollAnchor,
} from '../shared/scrollAnchor'
import { applyAnchor, computeAnchor } from './scrollAnchor'

// ユーザー操作からこの時間内に発生したスクロールだけを「手動スクロール」とみなす(ms)。
// トラックパッドの慣性スクロールは wheel イベントが続くため、この間隔で足りる
const USER_INPUT_WINDOW_MS = 200

let lastUserInputAt = -Infinity
let isPointerDown = false
let frameRequested = false

function markUserInput(): void {
  lastUserInputAt = performance.now()
}

function isUserScrolling(): boolean {
  return isPointerDown || performance.now() - lastUserInputAt < USER_INPUT_WINDOW_MS
}

const inputOptions = { passive: true, capture: true } as const
window.addEventListener('wheel', markUserInput, inputOptions)
window.addEventListener('touchmove', markUserInput, inputOptions)
window.addEventListener('keydown', markUserInput, inputOptions)
window.addEventListener(
  'pointerdown',
  () => {
    isPointerDown = true
    markUserInput()
  },
  inputOptions
)
window.addEventListener('pointerup', () => (isPointerDown = false), inputOptions)
window.addEventListener('pointercancel', () => (isPointerDown = false), inputOptions)

// 手動スクロール中のタブだけが基準(マスター)になる。
// 同期で動かされたタブはユーザー操作がないため通知を返さず、往復による揺れが起きない
window.addEventListener(
  'scroll',
  () => {
    if (!isUserScrolling() || frameRequested) return
    frameRequested = true
    requestAnimationFrame(() => {
      frameRequested = false
      ipcRenderer.sendToHost(SCROLL_ANCHOR_CHANNEL, computeAnchor(window))
    })
  },
  { passive: true }
)

ipcRenderer.on(APPLY_SCROLL_ANCHOR_CHANNEL, (_event, anchor: ScrollAnchor) => {
  applyAnchor(window, anchor)
})
