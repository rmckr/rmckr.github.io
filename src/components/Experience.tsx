import { Trans } from 'react-i18next'
import { highlightComponents } from '@/lib/trans'
import { useReveal } from '../hooks/useReveal'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── Timeline entry ────────────────────────────────────────────────────────────
// Each entry has its own observer: when it's reached, its rail draws a
// one-shot stretch and the entry's dot ignites when the rail lands (delay in
// index.css). No scroll listeners — the animation never replays or un-draws.

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
  // Fires when the entry's top crosses ~50% of the screen.
  const ref = useReveal({ threshold: 0, rootMargin: '0px 0px -50% 0px' })
  const isLast = index === total - 1

  return (
    <div ref={ref} className={'relative flex gap-6 timeline-entry'}>
      {/* Rail */}
      <div className={'flex w-5 shrink-0 flex-col items-center'}>
        <span className={'relative z-10 mt-1 block size-2.5'}>
          {/* bg-accent is the finished state, shown when motion is reduced */}
          <span className={'block size-full rounded-full border-2 border-accent timeline-dot bg-accent'}/>
          <span className={'absolute inset-0 timeline-ping rounded-full bg-accent'}/>
        </span>

        {!isLast && (
          <div className={'relative mt-1 w-1 flex-1 overflow-hidden bg-subtle'}>
            {/* draws itself downward once the entry is revealed */}
            <div className={'absolute inset-0 timeline-fill bg-accent opacity-60'}/>
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

  // A bad translation edit must not crash the whole page — fall back to an empty list.
  const raw = t('experience.entries', { returnObjects: true })
  const entries = Array.isArray(raw) ? raw as ExperienceEntry[] : []

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
