import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { LuOrbit } from 'react-icons/lu'
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject
} from 'react'
import { useWide } from '../hooks/useWide'
import {
  computePlacements,
  RING_PCT,
  ringOf,
  STACKED_RING_PCT,
  type NodeBox,
  type Placement
} from '@/lib/placements'
import { cn } from '@/lib/utils'
import { skills, tagColors, type Skill, type SkillTag } from '../data'
import { useTranslation } from '../i18n/i18n'
import { Counter } from './Counter'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── Skills ───────────────────────────────────────────────────────────────────
// The stack as a HUD star chart: an orbit glyph at the centre, one SVG ring
// per proficiency tier (advanced inner), every skill a tier-styled dot riding
// its own ring with the label hanging below. Hovering a node dims the rest;
// in the side panel, hovering an orbit-legend entry or a tag group lights
// only that tier's / tag's nodes. Rings, placement and the collision
// relaxation live in lib/placements; on phones the rings unstack into one
// circle per tier.

/** The three tiers as rings, inner → outer — the one literal ring list. */
const RINGS = [0, 1, 2] as const

/** Degrees of orbit travel across the map's full scroll crossing, inner ring
    fastest — every node of a ring rides one wrapper, so one ring = one speed. */
const SPIN = [120, 72, 36] as const

/** Ring treatments, inner → outer: advanced brighter; proficient + basic
    share a colour and read apart by SHAPE (solid vs dotted). */
const RING_STROKE = [
  { width: 2, opacity: 0.7, dash: undefined },
  { width: 1.5, opacity: 0.3, dash: undefined },
  { width: 2, opacity: 0.3, dash: '1 6' }
] as const

/** Two-digit count for the HUD readouts. */
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Unique tags in first-seen order — skills is static, so this is a constant. */
const tags = [...new Set(skills.map((s) => s.tag))]

/** Per-tier node counts for the stacked centres and the legend (static too). */
const TIER_COUNT = RINGS.map((ring) => skills.filter((s) => ringOf(s) === ring).length)

/** The radial chart only lays out at md and up; below that the rings stack. */
const WIDE_MQ = '(min-width: 768px)'

/** The disc shared by nodes and legend samples: size-4, scaling to size-10's
    footprint on hover — `transform`, not width/height, so the bloom can never
    re-lay-out anything (the icon counter-scales to stay 16px). The shadow
    and outline scale with it; the legend layers its own size on top. */
const DISC_CLASS =
  'flex size-4 items-center justify-center rounded-full transition-[transform,box-shadow,outline] duration-200 ease-out group-hover:scale-[2.5]'

/** Tier treatment for a disc (accent = the skill's tag colour): advanced =
    solid dot with a separated ring, proficient = solid dot, basic = hollow
    with a tag-coloured outline. Active adds a tag glow. */
function discStyle(ring: 0 | 1 | 2, color: string, active: boolean): CSSProperties {
  const glow = `0 0 14px color-mix(in srgb, ${color} 55%, transparent)`
  const separated = '0 0 0 2px var(--color-bg), 0 0 0 3.5px ' // gap, then the ring

  if (ring === 0)
    return { background: color, boxShadow: `${separated}${color}${active ? `, ${glow}` : ''}` }
  if (ring === 1) return { background: color, boxShadow: active ? glow : 'none' }
  return {
    background: 'var(--color-surface)',
    outline: `1.5px solid ${color}`,
    boxShadow: active ? glow : 'none'
  }
}

/** Icon colour inside a disc: dark on the solid discs, tag colour in the
    hollow one (its interior is the page surface). */
const iconColor = (ring: 0 | 1 | 2, color: string) => (ring === 2 ? color : 'var(--color-bg)')

/** The map's measured width, plus each node's real box (wrapper/disc top,
    label bottom, half-width) read off the rendered markup — the collision
    math uses these, so it can't drift from the DOM. shortcut: the width
    re-reads on resize, the node box on the wide/stacked layout flip. */
function useMapMetrics(ref: RefObject<HTMLElement | null>, wide: boolean) {
  const [boxPx, setBoxPx] = useState(0)
  const [nodeBox, setNodeBox] = useState<NodeBox | null>(null)

  // Width: only a resize can change it without a render.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => setBoxPx(el.getBoundingClientRect().width)
    // No synchronous measure(): the ResizeObserver's initial observation
    // lands before first paint (same pattern as Experience.tsx).
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])

  // Node box: re-measured when the layout mode flips (wide ↔ stacked changes
  // the node width classes) — NOT after every render. The box can't change on
  // a hover-only re-render, and reading offset* across every node after each
  // of those was a forced synchronous layout per pointerenter/leave.
  // offset* reads, not rects — immune to the ring's mid-scroll rotation;
  // values are compared so it settles instead of looping.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measureBox = (): NodeBox | null => {
      let top = 0
      let bottom = 0
      let halfW = 0
      for (const n of el.querySelectorAll<HTMLElement>('[data-node]')) {
        // The wrapper is the bloomed disc's box (Node's no-reflow invariant).
        const h = n.offsetHeight / 2
        top = Math.min(top, -h)
        bottom = Math.max(bottom, h)
        halfW = Math.max(halfW, n.offsetWidth / 2)
        const label = n.querySelector<HTMLElement>('[data-label]')
        if (label) {
          top = Math.min(top, label.offsetTop - h)
          bottom = Math.max(bottom, label.offsetTop + label.offsetHeight - h)
        }
      }
      return halfW > 0 ? { top, bottom, halfW } : null
    }

    const commit = () => {
      const next = measureBox()
      setNodeBox((prev) =>
        prev && prev.top === next?.top && prev.bottom === next.bottom && prev.halfW === next.halfW
          ? prev
          : next
      )
    }

    // No synchronous commit(): the ResizeObserver's initial observation
    // lands before first paint (same pattern as the width observer above),
    // and it also catches container resizes — hover's transform-only bloom
    // never moves the layout box, so it can't loop.
    const obs = new ResizeObserver(commit)
    obs.observe(el)
    // Self-hosted fonts swap in after mount and move offsetTop without any
    // re-render — the one correction the old every-render re-read caught for
    // free.
    void document.fonts?.ready.then(commit)
    return () => obs.disconnect()
  }, [ref, wide])

  return { boxPx, nodeBox }
}

/** The orbit circles as one SVG layer (radii are % of the square box) —
    easier than bordered divs now that the rings differ in width, opacity AND
    dash pattern. `only` draws a single ring: how phones render one circle
    per stacked box. */
function RingLayer({ radii, only }: { radii: readonly number[]; only?: 0 | 1 | 2 }) {
  return (
    <svg viewBox={'0 0 100 100'} className={'absolute inset-0 size-full'} aria-hidden={'true'}>
      {radii.map((r, i) =>
        only !== undefined && i !== only ? null : (
          <circle
            key={r}
            cx={50}
            cy={50}
            r={r}
            fill={'none'}
            stroke={'var(--color-foreground)'}
            strokeWidth={RING_STROKE[i].width}
            strokeOpacity={RING_STROKE[i].opacity}
            strokeDasharray={RING_STROKE[i].dash}
            strokeLinecap={'round'}
            vectorEffect={'non-scaling-stroke'}
          />
        )
      )}
    </svg>
  )
}

/** One star: a tier-styled dot on its ring (icon reveals on hover) with the
    label hanging below, outside the centring box. */
function Node({
  placement,
  wide,
  active,
  spin,
  onHover
}: {
  placement: Placement
  /** Wide chart vs stacked phone circle — picks ring radii and label width
      (the w-24 / w-16 markup below is what useMapMetrics measures). */
  wide: boolean
  active: boolean
  /** This ring's scroll-driven orbit offset in degrees (the rotating wrapper
      carries it); the node counter-rotates so labels stay upright. */
  spin: MotionValue<number>
  onHover: (skill: Skill | null) => void
}) {
  const { skill, ring, angle } = placement
  const color = tagColors[skill.tag]
  const reduce = useReducedMotion()
  const counter = useTransform(spin, (v) => `rotate(${-v}deg)`)

  const ringPct = wide ? RING_PCT : STACKED_RING_PCT
  const rad = ((angle - 90) * Math.PI) / 180
  const left = 50 + ringPct[ring] * Math.cos(rad)
  const top = 50 + ringPct[ring] * Math.sin(rad)

  // Centre on the coordinate via Motion's own transform (it owns `transform`).
  return (
    <motion.button
      type={'button'}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        x: '-50%',
        y: '-50%'
      }}
      onPointerEnter={() => onHover(skill)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(skill)}
      onBlur={() => onHover(null)}
      className={'group pointer-events-auto'}
      aria-label={`${skill.name} — ${skill.tag}`}
    >
      <motion.span
        data-node={'true'}
        className={cn(
          'relative flex h-10 items-center justify-center transition-opacity duration-200',
          wide ? 'w-24' : 'w-16'
        )}
        style={{ opacity: active ? 1 : 0.3, transform: reduce ? undefined : counter }}
      >
        {/* Fixed-size wrapper: the dot blooms to size-10 on hover WITHOUT
            reflowing the node — the label used to move down as the dot grew,
            dropping a parked cursor into a dead gap. */}
        <span className={DISC_CLASS} style={discStyle(ring, color, active)}>
          <skill.icon
            aria-hidden={'true'}
            className={
              /* Counter-scale matches the disc's bloom, so the icon stays
                 16px inside the 2.5×-scaled disc */
              'opacity-0 transition-[opacity,transform] duration-150 group-hover:scale-[0.4] group-hover:opacity-100 group-focus-visible:opacity-100'
            }
            size={16}
            style={{ color: iconColor(ring, color) }}
          />
        </span>

        {/* Fixed position (14px below centre), so hover never moves it; it
            fades so the bloomed disc never sits behind the text. */}
        <span
          data-label={'true'}
          className={
            'absolute inset-x-0 top-1/2 mt-3.5 text-center meta text-2xs/tight transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0'
          }
        >
          {skill.name}
        </span>
      </motion.span>
    </motion.button>
  )
}

export function Skills() {
  const { t } = useTranslation()
  const wide = useWide(WIDE_MQ)
  const [hovered, setHovered] = useState<Skill | null>(null)
  const [group, setGroup] = useState<SkillTag | null>(null)
  const [orbit, setOrbit] = useState<0 | 1 | 2 | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // Where the map sits in the viewport: 0 entering, 0.5 with its centre on
  // the viewport's centre, 1 leaving. Each ring rotates by (crossing − 0.5)
  // × SPIN[ring] — negative, then 0, then positive — so the nodes rest
  // exactly on their computed angles when the section is centred.
  const { scrollYProgress: cross } = useScroll({
    target: mapRef,
    offset: ['start end', 'end start']
  })
  const spin = [
    useTransform(cross, (v) => (v - 0.5) * SPIN[0]),
    useTransform(cross, (v) => (v - 0.5) * SPIN[1]),
    useTransform(cross, (v) => (v - 0.5) * SPIN[2])
  ]
  // The same offsets as full transform strings for the rotating wrappers:
  // Motion's `rotate` shorthand goes through CSS variables, which the
  // compositor won't take off the main thread — a transform string can be
  // hardware-accelerated. The nodes keep the numeric spin to counter-rotate.
  const spinT = [
    useTransform(spin[0], (v) => `rotate(${v}deg)`),
    useTransform(spin[1], (v) => `rotate(${v}deg)`),
    useTransform(spin[2], (v) => `rotate(${v}deg)`)
  ]

  const { boxPx, nodeBox } = useMapMetrics(mapRef, wide)

  const placements = useMemo(() => {
    if (wide) return computePlacements(skills, tags, boxPx, nodeBox, 'wide')
    // One tier per stacked circle, computed alone so tiers don't false-collide.
    return RINGS.flatMap((ring) =>
      computePlacements(
        skills.filter((s) => ringOf(s) === ring),
        tags,
        boxPx,
        nodeBox,
        'stacked'
      )
    )
  }, [boxPx, nodeBox, wide])

  // Node hover wins over the group/orbit hovers for the dimming decision.
  const isActive = (skill: Skill) =>
    (group === null || skill.tag === group) &&
    (orbit === null || ringOf(skill) === orbit) &&
    (hovered === null || hovered.name === skill.name)

  // Tier names from hardcoded keys — no template literals, so the i18next
  // extractor can see the usage and the keys aren't reported as unused.
  const tierLabel = (ring: 0 | 1 | 2) =>
    ring === 0
      ? t('skills.tiers.advanced')
      : ring === 1
        ? t('skills.tiers.proficient')
        : t('skills.tiers.basic')

  /** One ring's rotating wrapper and its nodes — shared by the wide chart
      and the stacked phone circles (one ring = one animated rotation). */
  const ringGroup = (ring: 0 | 1 | 2) => (
    <motion.div
      key={ring}
      className={'pointer-events-none absolute inset-0'}
      style={reduce ? undefined : { transform: spinT[ring] }}
    >
      {placements
        .filter((placement) => placement.ring === ring)
        .map((placement) => (
          <Node
            key={placement.skill.name}
            placement={placement}
            wide={wide}
            active={isActive(placement.skill)}
            spin={spin[ring]}
            onHover={setHovered}
          />
        ))}
    </motion.div>
  )

  return (
    <Section id={'skills'}>
      <SectionHeader label={t('skills.label')} heading={t('skills.heading')} />

      <div className={'stagger'}>
        <div
          className={
            'mt-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-12'
          }
        >
          {/* The map — one square chart on wide screens; on phones the rings
              unstack into three stacked circles, one per proficiency tier */}
          <div
            ref={mapRef}
            className={cn(
              'relative mx-auto flex w-[min(86vw,24rem)] flex-col',
              wide ? 'aspect-square w-[min(72svh,48rem)]' : 'gap-6'
            )}
          >
            {wide ? (
              <>
                <RingLayer radii={RING_PCT} />

                {/* Hub — the chart's own symbol: a static orbit glyph (the
                    live counts live in the side panel) */}
                <div className={'absolute top-1/2 left-1/2 -translate-1/2'} aria-hidden={'true'}>
                  <LuOrbit className={'text-accent'} size={48} />
                </div>

                {/* One rotating wrapper per ring: transform-origin is the
                    map's centre by default, and pointer-events pass through
                    so nodes in earlier wrappers stay hoverable. */}
                {RINGS.map((ring) => ringGroup(ring))}
              </>
            ) : (
              RINGS.map((ring) => (
                <div key={ring} className={'relative aspect-square w-full'}>
                  <RingLayer radii={STACKED_RING_PCT} only={ring} />

                  {/* Tier label in the empty middle */}
                  <div
                    className={'absolute inset-0 flex flex-col items-center justify-center gap-1'}
                    aria-hidden={'true'}
                  >
                    <p className={'label text-2xs'}>{tierLabel(ring)}</p>
                    <p className={'meta text-2xs text-muted tabular-nums'}>
                      {pad2(TIER_COUNT[ring])}
                    </p>
                  </div>

                  {ringGroup(ring)}
                </div>
              ))
            )}
          </div>

          {/* Side panel — orbit legend from the real disc treatments, and the
              tag groups: hovering a group lights only its nodes */}
          <aside className={'mx-auto w-full max-w-104 lg:mx-0 lg:w-68'}>
            <div className={'flex flex-col gap-5 card bg-surface p-6'}>
              <div className={'flex flex-col gap-3'}>
                <p className={'meta text-foreground/70 uppercase'}>
                  {'// '}
                  {t('skills.orbits')}
                </p>
                {RINGS.map((ring) => (
                  <div
                    key={ring}
                    onPointerEnter={() => setOrbit(ring)}
                    onPointerLeave={() => setOrbit(null)}
                    className={'flex cursor-pointer items-center gap-3'}
                  >
                    <span
                      aria-hidden={'true'}
                      className={cn(DISC_CLASS, 'size-4 shrink-0')}
                      style={discStyle(ring, 'var(--color-accent)', false)}
                    />
                    <span className={'flex-1 label text-sm text-foreground'}>
                      {tierLabel(ring)}
                    </span>
                    <Counter
                      value={TIER_COUNT[ring]}
                      format={pad2}
                      className={'meta text-foreground/70 tabular-nums'}
                    />
                  </div>
                ))}
              </div>

              <div className={'flex flex-col gap-2.5 border-t border-subtle pt-4'}>
                <p className={'meta text-foreground/70 uppercase'}>
                  {'// '}
                  {t('skills.groups')}
                </p>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    onPointerEnter={() => setGroup(tag)}
                    onPointerLeave={() => setGroup(null)}
                    className={'flex cursor-pointer items-center gap-3 label text-sm link-muted'}
                  >
                    <span
                      aria-hidden={'true'}
                      className={'size-2 rounded-full'}
                      style={{ background: tagColors[tag] }}
                    />
                    {tag}
                    <span className={'ml-auto text-xs text-foreground/70 tabular-nums'}>
                      {pad2(skills.filter((s) => s.tag === tag).length)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  )
}
