import type { PointerEvent as ReactPointerEvent } from 'react'
import { memo, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Skill } from '@/data/index'
import { skillGroups, skills } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

const TIER_KEY = { 1: 'basic', 2: 'proficient', 3: 'advanced' } as const

const byName = new Map(skills.map((skill) => [skill.name, skill]))

/** Resolved once, so a rail keeps the same list on every render and a label
 *  changing in the light never re-renders the marks. */
const RAILS = new Map<string, Skill[]>(
  skillGroups.map((group) => [
    group.key,
    group.skills.flatMap((name) => {
      const skill = byName.get(name)
      return skill ? [skill] : []
    })
  ])
)

/** The pointer the card answers: a mouse, not a finger. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** Module-level, so the store's subscribe is the same function on every render. */
function subscribeFinePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function finePointer() {
  return window.matchMedia(FINE_POINTER).matches
}

/**
 * The group's tools as a still row. The marks sit back at `muted`; the row that
 * owns the card takes them up to ink, and the mark's own colour transition
 * carries that change. A pointer over a mark names it and frames it. The names
 * are carried by the tooltip and the list below, so the marks are hidden from
 * assistive tech and the same skills follow as a plain list.
 */
const LogoRail = memo(function LogoRail({
  items,
  lit,
  named,
  mirrored
}: {
  items: Skill[]
  lit?: boolean
  /** The mark the tooltip is naming: it keeps the frame and the ink there. */
  named?: string | null
  /** The row's name is on the right, so the rail takes the left of the row. */
  mirrored?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className={cn('relative mt-4 lg:mt-0', lit && 'rail-lit')}>
      {/* Wide, the row is split at the half and the rail holds the side the name
          does not: it stands against the row's outer edge, so the marks and the
          name answer each other across the seam rather than both crowding it. */}
      <ul
        aria-hidden="true"
        className={cn(
          'flex flex-wrap items-center gap-4 py-10',
          mirrored ? 'lg:justify-start' : 'lg:justify-end'
        )}
      >
        {items.map((skill) => {
          const Icon = skill.icon

          return (
            <li
              key={skill.name}
              data-skill={skill.name}
              data-named={skill.name === named ? '' : undefined}
              className="rail-item"
            >
              <Icon className="rail-mark size-12 shrink-0" />
            </li>
          )
        })}
      </ul>

      <ul className="sr-only">
        {items.map((skill) => (
          <li key={skill.name}>
            {skill.name}, {t(`skills.tiers.${TIER_KEY[skill.tier]}`)}
          </li>
        ))}
      </ul>
    </div>
  )
})

/**
 * Skills: four names in one column, each with its tools still in a row beside
 * it, every second row mirrored. The section's one chrome is a single accent card
 * that travels from row to row, and the mark under the pointer is named above
 * itself.
 */
export function Skills() {
  const { t, i18n } = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const rowsRef = useRef<(HTMLLIElement | null)[]>([])
  const [active, setActive] = useState<Skill | null>(null)
  // Desktop opens on the first row; a touch device opens neutral, because a
  // card with no pointer behind it would read as a selected filter. The pointer
  // is read from the browser's own query, so the prerendered markup and the
  // client agree on the first paint.
  const hasPointer = useSyncExternalStore(subscribeFinePointer, finePointer, () => true)
  const [row, setRow] = useState(0)
  const current = hasPointer ? row : null

  // The card answers the pointer rather than the scroll: a row takes it as the
  // pointer enters and keeps it once the pointer has left, so exactly one row
  // is in focus and moving the page never changes which one.
  function focusRow(event: ReactPointerEvent<HTMLElement>, index: number) {
    if (event.pointerType !== 'mouse') return
    setRow((row) => (row === index ? row : index))
  }

  // The tooltip stands on the mark it names rather than riding the cursor: the
  // plate and the frame then sit on one box, the reading surface never lands
  // over a neighbour, and the hand stays free to keep moving. A mouse names a
  // mark as it passes over it; a finger, which has no hover, names the one it
  // lands on.
  const markRef = useRef<HTMLElement | null>(null)

  function trackPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const mouse = event.pointerType === 'mouse'
    if (mouse ? event.type !== 'pointermove' : event.type !== 'pointerdown') return

    markRef.current = (event.target as Element).closest<HTMLElement>('[data-skill]')
    setActive(markRef.current ? (byName.get(markRef.current.dataset.skill ?? '') ?? null) : null)
  }

  // The plate is as wide as the name it holds, so it is placed after the render
  // that wrote that name — centred on the mark, and held inside the section
  // rather than crossing the page's edge.
  useLayoutEffect(() => {
    const tip = tipRef.current
    const frame = wrapRef.current
    const mark = markRef.current
    if (!tip || !frame || !mark) return

    const frameBox = frame.getBoundingClientRect()
    const box = mark.getBoundingClientRect()
    const room = Math.max(frameBox.width - tip.offsetWidth, 0)
    // Centred on the mark: the plate is as wide as its own name, so it is hung by
    // its middle rather than its edge and stays over the mark it names. Where
    // that would cross the section's edge it is held inside instead.
    const centre = box.left - frameBox.left + box.width / 2 - tip.offsetWidth / 2

    tip.style.setProperty('--tip-x', `${Math.min(Math.max(centre, 0), room)}px`)
    tip.style.setProperty('--tip-y', `${box.top - frameBox.top}px`)
  }, [active])

  // The section's one card: it takes the box of the row in focus and rides the
  // transition to it, so the accent moves from row to row instead of one card
  // fading in and out of each.
  useLayoutEffect(() => {
    const place = () => {
      const frame = wrapRef.current
      const row = current === null ? null : rowsRef.current[current]
      const card = cardRef.current
      if (!frame || !row || !card) return

      const frameBox = frame.getBoundingClientRect()
      const box = row.getBoundingClientRect()

      // The card travels on `translate`, not `top`: position becomes a composite
      // value, so crossing rows never lays out the section. The inset is unchanged
      // (+6 px at the top, 12 px less height); only the mechanism is.
      card.style.translate = `0 ${box.top - frameBox.top + 6}px`
      card.style.height = `${box.height - 12}px`
      // Edge to edge, but measured against the client area rather than `100vw`:
      // the scrollbar's width is not part of it, so neither arc is cut.
      card.style.left = `${-frameBox.left}px`
      card.style.width = `${document.documentElement.clientWidth}px`
    }

    place()
    void document.fonts.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [current, i18n.language])

  return (
    <Section id="skills">
      <div
        ref={wrapRef}
        className="relative"
        onPointerMove={trackPointer}
        onPointerDown={trackPointer}
        onPointerLeave={(event) => {
          // A touch leaves as it lifts; its name stays until the next tap.
          if (event.pointerType === 'mouse') {
            markRef.current = null
            setActive(null)
          }
        }}
      >
        <SectionHeader heading={t('skills.heading')} />

        <p className="section-lead mt-6">{t('skills.lead')}</p>

        {current !== null && (
          <div
            ref={cardRef}
            aria-hidden="true"
            className="holo-card-face pointer-events-none absolute top-0 left-0 rounded-2xl border border-white/20 transition-[translate,height] duration-200 ease-out motion-reduce:transition-none"
          />
        )}

        <ol className="relative mt-12 md:mt-14">
          {skillGroups.map((group, index) => {
            const items = RAILS.get(group.key) ?? []
            const mirrored = index % 2 === 1

            return (
              <li
                key={group.key}
                ref={(node) => {
                  rowsRef.current[index] = node
                }}
                onPointerEnter={(event) => focusRow(event, index)}
              >
                <div
                  className={cn(
                    'relative flex flex-col gap-2 py-10 md:py-12 lg:flex-row lg:items-center lg:gap-x-(--seam) lg:py-14',
                    mirrored && 'lg:flex-row-reverse'
                  )}
                >
                  <h3
                    className={cn(
                      'text-display-lg text-balance lg:min-w-0 lg:flex-1',
                      mirrored && 'lg:text-right'
                    )}
                  >
                    {t(`skills.items.${group.key}`)}
                  </h3>

                  <div className="lg:min-w-0 lg:flex-1">
                    <LogoRail
                      items={items}
                      lit={index === current}
                      named={active?.name ?? null}
                      mirrored={mirrored}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        {/* The rail's label: the mark under the pointer, named above the mark
            it belongs to. It is a reading surface rather than an instrument, so
            it carries no ring and nothing to keep in step with the row. */}
        <span
          ref={tipRef}
          aria-hidden="true"
          className="label skill-tip whitespace-nowrap px-2.5 py-1.5 text-foreground"
          style={{ opacity: active ? 1 : 0 }}
        >
          {active?.name}
          {active && (
            <span className="text-muted">
              {' · '}
              {t(`skills.tiers.${TIER_KEY[active.tier]}`)}
            </span>
          )}
        </span>
      </div>
    </Section>
  )
}
