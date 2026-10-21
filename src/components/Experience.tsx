import { highlightComponents } from '@/lib/trans'
import { cn } from '@/lib/utils'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Trans } from 'react-i18next'
import { LuArrowRight } from 'react-icons/lu'
import { usePinStage } from '../hooks/usePinStage'
import { useWide } from '../hooks/useWide'
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

/** Static-breakpoint (in sync with the ≤768px gates in index.css): phones
    get the un-pinned strip instead of the scroll scrub. */
const NARROW_MQ = '(max-width: 768px)'

/** Edge fade width in % of the strip — the mask's two variable stops. */
const EDGE_FADE_PCT = 10
/** Fraction of the travel over which each edge fades in / back out. */
const EDGE_RAMP = 0.15

/** Writes --edge-l / --edge-r on the masked wrapper, where f is the
    position through the strip (0 = start … 1 = end): the left edge fades in
    over the first EDGE_RAMP of travel, the right edge fades out over the
    last — right-only at the start, both sides mid-strip, left-only at the
    end. Direct style writes: no re-render, and both scroll drivers (the
    scrub's MotionValue and the static scroller's scroll event) call it. */
function setEdgeFade(el: HTMLElement | null, f: number): void {
  if (!el) return
  const t = Math.min(1, Math.max(0, f))
  const left = (Math.min(1, t / EDGE_RAMP) * EDGE_FADE_PCT).toFixed(2)
  const right = (Math.min(1, (1 - t) / EDGE_RAMP) * EDGE_FADE_PCT).toFixed(2)
  el.style.setProperty('--edge-l', `${left}%`)
  el.style.setProperty('--edge-r', `${right}%`)
}

export function Experience() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  // Phones (≤768px) take the same rendering reduced motion gets: no runway,
  // no sticky stage — and the strip below becomes a native swipe scroller.
  const narrow = useWide(NARROW_MQ)
  const staticMode = Boolean(reduce) || narrow
  const viewportRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const edgeRef = useRef<HTMLDivElement>(null)

  // Pin recipe (measurement, phase-matched offsets, runway height) is
  // shared with GitHubSection's stage — see usePinStage.
  const { runwayRef, stageRef, scrollYProgress: p, runwayHeight } = usePinStage(!staticMode)

  // Strip geometry: range = row width minus one card (the full travel), lead =
  // the half-viewport inset that centres a card at both ends. Deliberately
  // React state, not MotionValues: a MotionValue set inside a layout effect
  // can be missed (same-value no-op or a cancelled frame update), which left
  // x stuck at 0 until the first scroll.
  const [geo, setGeo] = useState({ lead: 0, range: 0 })

  // The strip's only animation: one composited transform, scrubbed by scroll.
  // Under reduced motion nothing ever measures, so x stays 0.
  const x = useTransform(p, [0, 1], [geo.lead, geo.lead - geo.range])

  // Edge fades follow progress through the strip in scrub mode; static mode
  // feeds setEdgeFade from the strip's own scroll event instead.
  useMotionValueEvent(p, 'change', (f) => {
    if (!staticMode) setEdgeFade(edgeRef.current, f)
  })

  // Set before first paint so the mask is right before the first event —
  // and re-synced whenever static mode toggles (an inherited scrollLeft
  // survives an orientation change).
  useLayoutEffect(() => {
    if (staticMode) {
      const el = viewportRef.current
      const max = el ? el.scrollWidth - el.clientWidth : 0
      setEdgeFade(edgeRef.current, el && max > 0 ? el.scrollLeft / max : 0)
    } else {
      setEdgeFade(edgeRef.current, p.get())
    }
  }, [staticMode, p])

  useLayoutEffect(() => {
    if (staticMode) return
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
  }, [staticMode])

  // A bad translation edit must not crash the whole page — fall back to an empty list.
  const raw = t('experience.entries', { returnObjects: true })
  const entries = Array.isArray(raw) ? (raw as ExperienceEntry[]) : []
  const total = Math.max(entries.length, 1)

  // The strip's edges dissolve instead of clipping cards mid-card. The cards
  // AND the accent rule sit inside this wrapper, so they share the mask:
  // two variable stops (--edge-l / --edge-r, written by setEdgeFade) fade
  // each side only while content actually runs past it. The fallbacks are
  // the correct pre-JS / all-the-way-left state (right edge only).
  const edgeFade = {
    maskImage:
      'linear-gradient(to right, transparent 0, black var(--edge-l, 0%), black calc(100% - var(--edge-r, 10%)), transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(to right, transparent 0, black var(--edge-l, 0%), black calc(100% - var(--edge-r, 10%)), transparent 100%)'
  } satisfies CSSProperties

  // Static mode: the scroller itself is the source of truth for the fades.
  const onStripScroll = () => {
    if (!staticMode) return
    const el = viewportRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdgeFade(edgeRef.current, max > 0 ? el.scrollLeft / max : 0)
  }

  return (
    <Section id={'experience'}>
      <div ref={runwayRef} style={!staticMode ? { height: runwayHeight(total) } : undefined}>
        {/* Stage — sticks for the whole runway: header and intro stay static
            while the strip scrolls left through the viewport */}
        <div ref={stageRef} className={cn('stagger', !staticMode ? 'sticky top-32 flex flex-col' : '')}>
          <SectionHeader label={t('experience.label')} heading={t('experience.heading')} />

          <p className={'max-w-3xl copy'}>
            <Trans i18nKey={'experience.desc'} components={highlightComponents} />
          </p>

          <div ref={edgeRef} className={'relative mt-10'} style={edgeFade}>
            {/* Strip viewport: pinned + overflow-hidden under scroll (page
                scroll scrubs the row); a native horizontal scroller under
                reduced motion or below 768px — touch swipe, snap-aligned,
                overscroll contained so a flick never moves the page.
                Focusable only when it scrolls natively. */}
            <div
              ref={viewportRef}
              className={
                !staticMode
                  ? 'overflow-hidden'
                  : 'overflow-x-auto snap-x snap-mandatory overscroll-x-contain'
              }
              role={'region'}
              aria-label={t('experience.label')}
              tabIndex={staticMode ? 0 : undefined}
              onScroll={onStripScroll}
            >
              {/* No lead-in padding: centring is `lead` inside the pipeline,
                  so the row's measured width minus one card IS the travel. */}
              <motion.div ref={rowRef} style={{ x }}>
                {/* One column per entry. The tick sits centred in the gap
                    BEFORE the card — the boundary where that entry starts —
                    half a gap (1rem of gap-8) left of the column. Labels are
                    absolute so the column keeps exactly the card's width. */}
                <div className={'flex w-max gap-8'}>
                  {entries.map((entry, i) => (
                    <div
                      key={entry.period + entry.title}
                      className={
                        'relative flex w-[85vw] max-w-xl shrink-0 snap-start flex-col lg:min-w-xl'
                      }
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

                      {/* Swipe affordance: only where the strip actually
                          scrolls natively, only on the first card — it
                          scrolls away with the card on the first swipe.
                          Lives in the empty tick row: clear of the card's
                          text and of the mask's right-edge fade. */}
                      {i === 0 && staticMode && (
                        <span
                          aria-hidden={'true'}
                          className={
                            'swipe-hint pointer-events-none absolute bottom-6 right-6'
                          }
                        >
                          <LuArrowRight size={14} />
                        </span>
                      )}
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
