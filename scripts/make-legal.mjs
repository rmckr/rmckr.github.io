import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// The /legal route shares the home page's document head, so its canonical and
// its title are corrected after the build. Flat or nested, whichever the build
// wrote.
const flat = 'dist/legal.html'
const nested = 'dist/legal/index.html'

if (!existsSync(flat) && !existsSync(nested)) {
  console.error('make-legal: the /legal route was not prerendered')
  process.exit(1)
}

const file = existsSync(flat) ? flat : nested

const html = readFileSync(file, 'utf8')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Legal notice &amp; privacy · Lukas Romacker</title>')
  .replace(
    /<link[^>]*rel="canonical"[^>]*>/,
    '<link rel="canonical" href="https://rmckr.com/legal">'
  )

writeFileSync(file, html)
