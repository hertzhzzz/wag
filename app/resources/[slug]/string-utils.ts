// ============================================
// STRING UTILITIES (Browser + Node.js compatible)
// ============================================

const SLUG_SEPARATOR = '-'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, SLUG_SEPARATOR)
    .replace(/(^-|-$)/g, '')
}
