import { useEffect, useRef, useState } from 'react'
import { Trans } from 'react-i18next'
import { cn } from '@/lib/utils'
import { highlightComponents } from '@/lib/trans'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
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
      <div className={'flex w-5 shrink-0 flex-col items-center'}>
        <span className={'relative z-10 mt-1 block size-2.5'}>
          <span
            className={cn(
              'block size-full rounded-full border-2 border-accent transition-[background-color,box-shadow] duration-300',
              dotActive ? 'bg-accent shadow-[0_0_8px] shadow-accent/50' : 'bg-bg'
            )}
          />

          {/* ripple while the entry is in focus */}
          {dotActive &&
            <span className={'absolute inset-0 rounded-full bg-accent motion-safe:animate-ping'}/>}
        </span>
        {!isLast && (
          <div className={'relative mt-1 w-1 flex-1 overflow-hidden bg-subtle'}>
            {/* animated fill — height is dynamic, inline style is correct */}
            <div
              className={'absolute top-0 left-0 w-full bg-accent opacity-60'}
              style={{ height: `${lineHeight}px` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={'pb-6'}>
        <p className={'mb-1 meta'}>{entry.period}</p>
        <p className={'font-semibold text-foreground'}>
          {entry.title}
          {' '}
          <span className={'text-sm font-normal text-muted'}>{entry.note}</span>
        </p>
        <p className={'mt-0.5 text-sm text-accent'}>{entry.organisation}</p>
        <p className={'mt-1.5 text-sm/relaxed text-muted'}>{entry.desc}</p>
      </div>
    </div>
  )
}

// ── Experience section ────────────────────────────────────────────────────────

export function Experience() {
  const { t } = useTranslation()

  const entries = t('experience.entries', { returnObjects: true }) as ExperienceEntry[]

  return (
    <Section id={'experience'} contentClassName={'grid grid-cols-1 lg:grid-cols-5 gap-16 items-start stagger'}>
      {/* Left — text */}
      <div className={'lg:col-span-3'}>
        <SectionHeader label={t('experience.label')} heading={t('experience.heading')}/>

        <p className={'copy'}>
          <Trans i18nKey={'experience.desc'} components={highlightComponents}/>
        </p>
      </div>

      {/* Right — education timeline */}
      <div className={'lg:col-span-2'}>
        {entries.map((entry, i, arr) => (
          <TimelineEntry
            key={entry.period + entry.title}
            entry={entry}
            index={i}
            total={arr.length}
          />
        ))}
      </div>
    </Section>
  )
}
