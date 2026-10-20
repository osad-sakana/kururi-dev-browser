import type { ScrollAnchor } from '../shared/scrollAnchor'

const LANDMARK_SELECTOR = '[id], h1, h2, h3, h4, h5, h6, section, article, main, header, footer, nav, aside'
const MAX_ANCESTORS = 5

function isUniqueId(doc: Document, id: string): boolean {
  return doc.querySelectorAll(`#${CSS.escape(id)}`).length === 1
}

function buildSelector(doc: Document, el: Element): string {
  const parts: string[] = []
  let current: Element | null = el
  while (current && current !== doc.documentElement) {
    if (current.id && isUniqueId(doc, current.id)) {
      parts.unshift(`#${CSS.escape(current.id)}`)
      break
    }
    const parent: Element | null = current.parentElement
    const tag = current.tagName.toLowerCase()
    const sameTag = parent
      ? Array.from(parent.children).filter((c) => c.tagName === current!.tagName)
      : []
    const index = sameTag.indexOf(current) + 1
    parts.unshift(sameTag.length > 1 ? `${tag}:nth-of-type(${index})` : tag)
    current = parent
  }
  return parts.join(' > ')
}

function pageRatioOf(win: Window): number {
  const max = win.document.documentElement.scrollHeight - win.innerHeight
  return max > 0 ? win.scrollY / max : 0
}

function findTopElement(doc: Document): Element | null {
  let found: Element | null = null
  doc.querySelectorAll(LANDMARK_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.height > 0 && rect.top <= 1 && rect.bottom > 1) found = el
  })
  return found
}

export function computeAnchor(win: Window): ScrollAnchor {
  const doc = win.document
  const pageRatio = pageRatioOf(win)
  const top = findTopElement(doc)
  if (!top) return { selectors: [], offsetRatio: 0, pageRatio }

  const rect = top.getBoundingClientRect()
  const selectors: string[] = []
  let current: Element | null = top
  while (
    current &&
    current !== doc.body &&
    current !== doc.documentElement &&
    selectors.length <= MAX_ANCESTORS
  ) {
    selectors.push(buildSelector(doc, current))
    current = current.parentElement
  }
  return { selectors, offsetRatio: Math.max(0, -rect.top) / rect.height, pageRatio }
}

function queryVisible(doc: Document, selector: string): Element | null {
  try {
    const el = doc.querySelector(selector)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return rect.height > 0 ? el : null
  } catch {
    return null
  }
}

export function applyAnchor(win: Window, anchor: ScrollAnchor): void {
  const doc = win.document
  for (let i = 0; i < anchor.selectors.length; i++) {
    const el = queryVisible(doc, anchor.selectors[i])
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const offset = i === 0 ? rect.height * anchor.offsetRatio : 0
    win.scrollTo({ top: win.scrollY + rect.top + offset, behavior: 'instant' })
    return
  }
  const max = doc.documentElement.scrollHeight - win.innerHeight
  if (max > 0) win.scrollTo({ top: max * anchor.pageRatio, behavior: 'instant' })
}
