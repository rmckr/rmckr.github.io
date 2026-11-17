import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// GitHub Pages serves dist/404.html for unknown paths, so the /404 route's
// prerendered page has to be that file. It shares the home page's document
// head, so the canonical becomes a noindex and the title becomes the 404's.
const file = 'dist/404.html'
if (!existsSync(file)) {
  console.error('make-404: the /404 route was not prerendered')
  process.exit(1)
}

const html = readFileSync(file, 'utf8')
  .replace(/<link[^>]*rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Page not found. · Lukas Romacker</title>')

writeFileSync(file, html)
