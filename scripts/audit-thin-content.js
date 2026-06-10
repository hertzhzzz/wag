const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const MIN_WORDS = 1500
const FLAG_WORDS = 800

function countWords(text) {
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*`~>\[\]()!_|{}.=-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return 0
  return plain.split(/\s+/).length
}

function scanDir(dir) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const slug = fullPath.replace(BLOG_DIR + '/', '').replace('.mdx', '')
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(raw)
      const wordCount = countWords(content)
      const status = wordCount < FLAG_WORDS ? 'CRITICAL' : wordCount < MIN_WORDS ? 'THIN' : 'OK'
      results.push({
        slug,
        title: data.title || '(no title)',
        date: data.date || 'unknown',
        wordCount,
        status,
      })
    }
  }
  return results
}

const articles = scanDir(BLOG_DIR)
articles.sort((a, b) => a.wordCount - b.wordCount)

const critical = articles.filter(a => a.status === 'CRITICAL')
const thin = articles.filter(a => a.status === 'THIN')
const ok = articles.filter(a => a.status === 'OK')

console.log(`\n=== Thin Content Audit ===`)
console.log(`Total articles: ${articles.length}`)
console.log(`  OK (>=${MIN_WORDS} words): ${ok.length}`)
console.log(`  THIN (${FLAG_WORDS}-${MIN_WORDS - 1} words): ${thin.length}`)
console.log(`  CRITICAL (<${FLAG_WORDS} words): ${critical.length}`)
console.log(`  Avg word count: ${Math.round(articles.reduce((s, a) => s + a.wordCount, 0) / articles.length)}`)

if (critical.length > 0) {
  console.log(`\n--- CRITICAL (<${FLAG_WORDS} words) ---`)
  critical.forEach(a => console.log(`  ${a.wordCount}w | ${a.slug} | ${a.date}`))
}

if (thin.length > 0) {
  console.log(`\n--- THIN (${FLAG_WORDS}-${MIN_WORDS - 1} words) ---`)
  thin.forEach(a => console.log(`  ${a.wordCount}w | ${a.slug} | ${a.date}`))
}
