import { Fragment } from 'react'

type SectionHeaderProps = {
  label: string,
  heading: string
}

/**
 * Keys derived from the content itself (never the array index): repeated items
 * get a numeric suffix so they stay unique within their list.
 */
function contentKeys(items: string[]) {
  const seen = new Map<string, number>()

  return items.map((item) => {
    const count = (seen.get(item) ?? 0) + 1
    seen.set(item, count)
    return count > 1 ? `${item}-${count}` : item
  })
}

/**
 * "01 // ABOUT" eyebrow plus a heading whose words slide up individually.
 * Each word is wrapped in a mask; `transitionDelay` staggers them by word
 * order and the reveal fires once a `data-visible` ancestor enters the
 * viewport.
 */
export function SectionHeader({ label, heading }: SectionHeaderProps) {
  const lines = heading.split('\n')
  const lineKeys = contentKeys(lines)
  let wordIndex = 0

  return (
    <>
      <p className={'mb-3 section-counter-title'}>{label}</p>

      <h2 className={'mb-16 text-heading tracking-display whitespace-pre-line'}>
        {lines.map((line, lineAt) => {
          const words = line.split(' ').filter(Boolean)
          const wordKeys = contentKeys(words)

          return (
            <span key={lineKeys[lineAt]} className={'block'}>
              {words.map((word, wordAt) => {
                const index = wordIndex++

                return (
                  <Fragment key={wordKeys[wordAt]}>
                    <span className={'word-mask'}>
                      <span style={{ transitionDelay: `${index * 60}ms` }}>{word}</span>
                    </span>
                    {' '}
                  </Fragment>
                )
              })}
            </span>
          )
        })}
      </h2>
    </>
  )
}
