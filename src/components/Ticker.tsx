import { Fragment } from 'react'
import { skills } from '@/data'

/**
 * Full-bleed marquee strip: one group of stack keywords rendered twice inside a
 * track that scrolls by exactly one group width (see `ticker-*` in index.css).
 * Each skill renders as its own `//` mark plus an icon and its uppercase name,
 * so every pair sits midway between two `//` marks (padding-based gaps keep
 * the rhythm seamless across the group join); cells pause on hover and stay
 * static for reduced-motion users.
 */
export function Ticker() {
  const group = (
    <div aria-hidden={'true'} className={'py-4 meta uppercase select-none'}>
      {skills.map((skill) => (
        <Fragment key={skill.name}>
          {/* eslint-disable-next-line @eslint-react/jsx-no-comment-textnodes */}
          <span className={'px-5 text-accent'}>//</span>
          <span className={'flex shrink-0 items-center justify-center gap-2.5 px-5'}>
            <skill.icon size={20}/>
            {skill.name}
          </span>
        </Fragment>
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
