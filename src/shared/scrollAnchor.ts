export interface ScrollAnchor {
  /** 基準要素から親方向へ並べたセレクタ。先頭が最も具体的な要素 */
  selectors: string[]
  /** 基準要素の高さに対する、上端からのスクロール量の割合 */
  offsetRatio: number
  /** 要素が見つからない場合のフォールバック（ページ全体に対する割合） */
  pageRatio: number
}

export const SCROLL_ANCHOR_CHANNEL = 'scroll-anchor'
export const APPLY_SCROLL_ANCHOR_CHANNEL = 'apply-scroll-anchor'
