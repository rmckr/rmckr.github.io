import { highlightComponents } from '@/lib/trans'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Trans } from 'react-i18next'
import { usePinStage } from '../hooks/usePinStage'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── Experience section ────────────────────────────────────────────────────────
// Pinned horizontal strip, identical at every viewport width. A sticky stage
// inside a scroll runway: header and intro hold still while ONE flat row of
// entry columns scrolls left as you scroll down. The row has exactly one
// animated value, a composited transform: x = lead − progress × range, where
// progress is scrollYProgress over the runway, range the row width minus one
// card, and lead the inset that centres the first card at p = 0 and the last
// at p = 1 (both measured by a ResizeObserver). Page scroll is the only input.
// Each column is one entry — the year tick centred above its card, riding the
// same transform, so tick and card can never drift apart. An overlay gradient
// dissolves the strip's edges.
//
// The runway grows with the entry count (inline height below): more entries
// means more scroll, not a faster swipe. Under reduced motion the
// same strip renders un-pinned as a native horizontal scroller — no runway,
// no sticky, no scrub.

type ExperienceEntry = {
  title: string
  organisation: string
  period: string
  desc: string
}

type TimelineEntryProps = {
  entry: ExperienceEntry
}

/** One card. Sizing lives on its column (below): the column pins the width,
    the card fills it — flex-1 so every card stretches to the tallest. */
function TimelineEntry({ entry }: TimelineEntryProps) {
  return (
    <article
      className={
        'w-full flex-1 card bg-surface p-6 transition-colors duration-200 hover-fine:border-accent'
      }
    >
      <div className={'flex items-baseline justify-between gap-4'}>
        <span className={'font-display text-muted'}>{entry.organisation}</span>
        <span className={'label text-2xs text-accent'}>{entry.period}</span>
      </div>

      <h3 className={'mt-2 text-2xl'}>{entry.title}</h3>

      <p className={'mt-2 text-sm/relaxed text-muted'}>{entry.desc}</p>
    </article>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Experience() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  // Pin recipe (measurement, phase-matched offsets, runway height) is
  // shared with GitHubSection's stage — see usePinStage.
  const { runwayRef, stageRef, scrollYProgress: p, runwayHeight } = usePinStage(!reduce)

  // Strip geometry: range = row width minus one card (the full travel), lead =
  // the half-viewport inset that centres a card at both ends. Deliberately
  // React state, not MotionValues: a MotionValue set inside a layout effect
  // can be missed (same-value no-op or a cancelled frame update), which left
  // x stuck at 0 until the first scroll.
  const [geo, setGeo] = useState({ lead: 0, range: 0 })

  // The strip's only animation: one composited transform, scrubbed by scroll.
  // Under reduced motion nothing ever measures, so x stays 0.
  const x = useTransform(p, [0, 1], [geo.lead, geo.lead - geo.range])

  useLayoutEffect(() => {
    if (reduce) return
    const viewport = viewportRef.current
    const row = rowRef.current
    if (!viewport || !row) return

    const measure = () => {
      // getBoundingClientRect, not scrollWidth: a transformed row still
      // reports its true width, so measurement can't feed back into x. One
      // column is exactly one card wide, so travel is row width minus one card.
      const columns = row.firstElementChild
      const column = columns?.firstElementChild
      const cardWidth = column instanceof HTMLElement ? column.getBoundingClientRect().width : 0
      const rowWidth = columns instanceof HTMLElement ? columns.getBoundingClientRect().width : 0
      const next = {
        lead: Math.max(0, (viewport.clientWidth - cardWidth) / 2),
        range: Math.max(0, rowWidth - cardWidth)
      }
      // Skip identical re-measures so the ResizeObserver can't loop React.
      setGeo((prev) => (prev.lead === next.lead && prev.range === next.range ? prev : next))
    }

    // No synchronous measure() here: the ResizeObserver's initial observation
    // lands before the first paint, so the opening frame is already centred.
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(row)
    return () => observer.disconnect()
  }, [reduce])

  // A bad translation edit must not crash the whole page — fall back to an empty list.
  const raw = t('experience.entries', { returnObjects: true })
  const entries = Array.isArray(raw) ? (raw as ExperienceEntry[]) : []
  const total = Math.max(entries.length, 1)

  // The strip's edges dissolve instead of clipping cards mid-card.
  const edgeFade = {
    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
  } satisfies CSSProperties

  return (
    <Section id={'experience'}>
      <div ref={runwayRef} style={!reduce ? { height: runwayHeight(total) } : undefined}>
        {/* Stage — sticks for the whole runway: header and intro stay static
            while the strip scrolls left through the viewport */}
        <div
          ref={stageRef}
          className={cn(
            'stagger',
            !reduce ? 'sticky top-32 flex flex-col' : ''
          )}
        >
          <SectionHeader label={t('experience.label')} heading={t('experience.heading')} />

          <p className={'max-w-3xl copy'}>
            <Trans i18nKey={'experience.desc'} components={highlightComponents} />
          </p>

          <div className={'relative mt-10'} style={edgeFade}>
            {/* Strip viewport: pinned + overflow-hidden under scroll (page
                scroll scrubs the row); the same strip as a native horizontal
                scroller under reduced motion. Focusable only when it scrolls. */}
            <div
              ref={viewportRef}
              className={!reduce ? 'overflow-hidden' : 'overflow-x-auto'}
              role={'region'}
              aria-label={t('experience.label')}
              tabIndex={reduce ? 0 : undefined}
            >
              {/* No lead-in padding: centring is `lead` inside the pipeline,
                  so the row's measured width minus one card IS the travel. */}
              <motion.div ref={rowRef} style={{ x }}>
                {/* One column per entry. The tick sits centred in the gap
                    BEFORE the card — the boundary where that entry starts —
                    half a gap (1rem of gap-8) left of the column. Labels are
                    absolute so the column keeps exactly the card's width. */}
                <div className={'flex w-max gap-8'}>
                  {entries.map((entry) => (
                    <div
                      key={entry.period + entry.title}
                      className={'flex w-[85vw] max-w-xl shrink-0 flex-col lg:min-w-xl'}
                    >
                      <div className={'relative mb-6 h-7'}>
                        <div className={'absolute top-0 left-0 -translate-x-4'}>
                          <span className={'absolute top-0 left-0 h-4 w-px bg-foreground'} />
                          <span className={'absolute top-4 left-0 -translate-x-1/2 label text-2xs'}>
                            {entry.period.slice(0, 4)}
                          </span>
                        </div>
                      </div>
                      <TimelineEntry entry={entry} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Accent rule overlays the strip but must not scroll with it */}
            <div className={'pointer-events-none absolute inset-x-0 top-0 h-2 bg-accent'} />
          </div>
        </div>
      </div>
    </Section>
  )
}
