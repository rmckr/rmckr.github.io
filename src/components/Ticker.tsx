import { skills } from '@/data'

/**
 * Full-bleed marquee strip: one group of stack keywords rendered twice inside a
 * track that scrolls by exactly one group width (see `ticker-*` in index.css).
 * Cells centre their `// SKILL` label, pause on hover and stay static when the
 * user prefers reduced motion.
 */
export function Ticker() {
  const group = (
    <div aria-hidden={'true'}>
      {skills.map((skill) => (
        <span
          key={skill.name}
          className={'flex shrink-0 items-center justify-center gap-2.5 px-7 py-4 meta tracking-widest whitespace-nowrap uppercase select-none'}
        >
          {/* eslint-disable-next-line @eslint-react/jsx-no-comment-textnodes */}
          <span className={'text-accent'}>//</span>
          {skill.name}
        </span>
      ))}
    </div>
  )

  return (
    <div className={'ticker'} aria-hidden={'true'}>
      <div className={'ticker-track'}>
        {group}
        {group}
      </div>
    </div>
  )
}
