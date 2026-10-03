import { useEffect, useRef, useState } from 'react'
import { Trans } from 'react-i18next'
import { useTranslation } from '../i18n/i18n'
import { useReveal } from '../hooks/useReveal'
import { SectionHeader } from './SectionHeader'

// ── Timeline entry ────────────────────────────────────────────────────────────

type ExperienceEntry = {
  title: string,
  note: string,
  organisation: string,
  period: string,
  desc: string
}

type TimelineEntryProps = {
  entry: ExperienceEntry,
  index: number,
  total: number
}

function TimelineEntry({ entry, index, total }: TimelineEntryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [lineHeight, setLineHeight] = useState(0)
  const isLast = index === total - 1

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.35 - rect.top) / el.offsetHeight))

      setLineHeight(Math.round(progress * el.offsetHeight))
    }

    window.addEventListener('scroll', update, { passive: true })
    requestAnimationFrame(update)

    return () => window.removeEventListener('scroll', update)
  }, [])

  const dotActive = lineHeight > 0

  return (
    <div ref={ref} className={'relative flex gap-6'}>
      {/* Rail */}
      <div className={'flex flex-col items-center w-5 shrink-0'}>
        <div
          className={'w-2.5 h-2.5 rounded-full border-2 z-10 mt-1 transition-colors duration-300 border-accent'}
          style={{
            background: dotActive ? 'var(--color-accent)' : 'var(--color-bg)',
            boxShadow: dotActive ? '0 0 8px rgba(229,53,53,0.5)' : 'none'
          }}
        />
        {!isLast && (
          <div className={'relative flex-1 mt-1 w-1 bg-white/8 overflow-hidden'}>
            {/* animated fill — height is dynamic, inline style is correct */}
            <div
              className={'absolute top-0 left-0 w-full opacity-60'}
              style={{ height: `${lineHeight}px`, background: 'var(--color-accent)' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={'pb-6'}>
        <p className={'font-mono text-xs text-muted mb-1'}>{entry.period}</p>
        <p className={'font-semibold text-foreground'}>
          {entry.title}
          {' '}
          <span className={'font-normal text-muted text-sm'}>{entry.note}</span>
        </p>
        <p className={'text-sm text-accent mt-0.5'}>{entry.organisation}</p>
        <p className={'text-sm text-muted leading-relaxed mt-1.5'}>{entry.desc}</p>
      </div>
    </div>
  )
}

// ── About section ─────────────────────────────────────────────────────────────

export function Experience() {
  const { t } = useTranslation()
  const ref = useReveal()

  const entries = t('experience.entries', { returnObjects: true }) as ExperienceEntry[]

  return (
    <section id={'experience'} className={'py-32'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal grid grid-cols-1 lg:grid-cols-5 gap-16 items-start'}>

          {/* Left — text */}
          <div className={'lg:col-span-3'}>
            <SectionHeader label={t('experience.label')} heading={t('experience.heading')}/>

            <p className={'space-y-5 text-muted leading-relaxed'}>
              <Trans
                i18nKey={'experience.desc'}
                components={{ highlight: <span className={'text-foreground'}/> }}
              />
            </p>
          </div>

          {/* Right — education timeline */}
          <div className={'lg:col-span-2'}>
            {[...entries].reverse().map((entry, i, arr) => (
              <TimelineEntry
                key={entry.period + entry.title}
                entry={entry}
                index={i}
                total={arr.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
