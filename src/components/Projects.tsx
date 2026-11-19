import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { featuredRepos, GITHUB_USERNAME } from '@/data/index'
import { sections } from '@/data/sections'
import { scrollToY } from '@/hooks/useSmoothScroll'
import { useTranslation } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { HoloFoil, usePointerRatio } from './HoloCard'
import { SectionHeader } from './SectionHeader'

type Repo = (typeof featuredRepos)[number]

/** The front face's light, the same signature the first skills card carried. */
const FRONT_LIGHT = { angle: 104, lamp: 56 }

const CARDS = featuredRepos.length

/** One card per face, evenly spaced: four cards make the box, five make a
 *  pentagon. The radius is half a card over tan(π/n) card widths. */
const CUBE_STEP = 360 / CARDS
const CUBE_R = 1 / (2 * Math.tan(Math.PI / CARDS))

/** The cosine at 45°, the exact handover between two faces: each face is lit
 *  only inside the front half, so both are neutral at the handover and the
 *  frame never shows two red cards. */
const FADE_FROM = Math.cos(Math.PI / 4)

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

/** The ring's detent: every face is a well the turn falls into. The mapping is
 *  still one-to-one — it leaves each face exactly where it was and compresses
 *  the turn on either side of it — so a stop near a face lands on it while a
 *  gesture carries through the middle. It shapes the drawing, not the document:
 *  nothing is snapped and no scroll position is pulled. */
function detent(turn: number, steps: number) {
  if (steps <= 0) return turn
  const step = turn * steps
  return (step - 0.5 * Math.sin(2 * Math.PI * step) / (2 * Math.PI)) / steps
}

/**
 * One project card: the cover, the counter and the repository. Every card
 * carries the same chrome, and the accent is painted over it by the face's own
 * `--lit` — 1 facing the reader, 0 once it has turned away — so the red passes
 * from card to card through the turn instead of living on one face. Only the
 * fold's card wears the foil, and only while it is still in the fold.
 * The title is the section's one path out: a link to the repository, tabbable
 * only on the face the ring is showing, so a card behind is not a tab stop.
 */
export function ProjectCard({
  repo,
  index,
  inHero,
  current
}: {
  repo: Repo
  index: number
  inHero: boolean
  current: boolean
}) {
  const { t } = useTranslation()
  const poseRef = useRef<HTMLDivElement>(null)
  const holo = index === 0
  const count = String(index + 1).padStart(2, '0')
  const total = String(featuredRepos.length).padStart(2, '0')

  usePointerRatio(poseRef, holo && inHero)

  return (
    <div className="relative size-full">
      <div
        ref={poseRef}
        data-pose
        className={cn('cube-card size-full transform-3d', holo && inHero && 'animate-breathe motion-reduce:animate-none')}
        style={
          holo
            ? {
                // The skills card's own lean, relaxed as the card lands: at rest
                // the top edge and the left edge sit away from the reader, and
                // the side the pointer is over is pushed further back. In the
                // box it is square. The perspective is part of the transform
                // because the face the card hangs in is flat: the lean is drawn
                // in the card's own depth instead of being compressed into that
                // plane, which is what read as a skew.
                transform:
                  'perspective(1600px) rotateX(calc((6deg - 12deg * var(--ratio-y, 0)) * (1 - var(--p, 1)))) rotateY(calc((-12deg + 18deg * var(--ratio-x, 0)) * (1 - var(--p, 1))))'
              }
            : undefined
        }
      >
        <div className="relative size-full overflow-hidden rounded-2xl border bg-surface/50 edge-accent">
          {/* Inner hairline: a trading card's frame, in the page's own line
              while the face is neutral and white while it is accent. */}
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-lg border border-line"
            style={{ opacity: 'calc(1 - var(--lit, 1))' }}
          />
          {/* The accent face: one flat fill, no foil, so the red is the same
              surface on every card it passes through. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[inherit] holo-card-face"
            style={{ opacity: 'var(--lit, 1)' }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-4 z-20 rounded-lg border border-white/25"
            style={{ opacity: 'var(--lit, 1)' }}
          />

          <div className="relative flex size-full flex-col p-7">
            <div className="relative z-20 flex items-baseline justify-between gap-3">
              <span className="label tabular-nums ink-accent-soft">
                {count} / {total}
              </span>
              <span className="label ink-accent-soft">{t('projects.label')}</span>
            </div>

            {/* The cover carries no frame: it is shown whole against the card's
                own surface, which is its mat, so a banner is never cut or
                boxed. It is under the face's foil, not a copy of it. */}
            <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-md">
              {repo.image ? (
                <img
                  src={repo.image}
                  alt=""
                  width={repo.width}
                  height={repo.height}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              ) : (
                <div className="grid size-full place-items-center px-4">
                  <span className="text-center font-brand text-display-lg leading-none ink-accent">
                    {repo.name}
                  </span>
                </div>
              )}
            </div>

            <div className="relative z-20 mt-6">
              <a
                href={`https://github.com/${GITHUB_USERNAME}/${repo.name}`}
                aria-label={t('projects.repoLink', { name: repo.name })}
                tabIndex={current ? undefined : -1}
                className="press underline-offset-4 hover-fine:underline"
              >
                <p className="text-lead font-medium ink-accent wrap-break-word">{repo.name}</p>
              </a>
              <p className="mt-1.5 text-body text-pretty ink-accent-soft">
                {t(`projects.items.${repo.id}`)}
              </p>
            </div>
          </div>

          {/* The foil is one light field over the whole face, painted above the
              cover: the image is lit by the card's own lamp rather than cut out
              of the foil, and the type is lifted over it. It belongs to the
              fold, so it leaves with the card. */}
          {holo && (
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[inherit]"
              style={{ '--foil': 'calc((1 - var(--p, 1)) * var(--lit, 1))' } as CSSProperties}
            >
              <HoloFoil angle={FRONT_LIGHT.angle} lamp={FRONT_LIGHT.lamp} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * The section is pinned for a little over two screens: the first screen is the
 * card's flight out of the fold (`--p`), the rest is the ring's turn (`--rot`).
 * The turn hands the accent from face to face — each face is `--lit` by its
 * angle to the reader, faded in as it comes round — and it stops on the last
 * card, one face short of where it started. Where the scroll cannot turn the
 * box (`lg` down, reduced motion) the project index walks it instead.
 */
function useCubeScroll(
  rootRef: RefObject<HTMLElement | null>,
  onHeroChange: (inHero: boolean) => void,
  onEntryChange: (entry: number) => void
) {
  const goRef = useRef<(index: number) => void>(() => undefined)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const faces = Array.from(root.querySelectorAll<HTMLElement>('[data-face]'))
    const heroLine = document.querySelector<HTMLElement>('[data-hero-center]')
    const heroGutter = document.querySelector<HTMLElement>('[data-hero-gutter]')
    const slot = root.querySelector<HTMLElement>('[data-cube-slot]')
    const liftEl = root.querySelector<HTMLElement>('[data-cube-lift]')
    const cubeEl = root.querySelector<HTMLElement>('[data-cube]')
    const stageEl = root.querySelector<HTMLElement>('[data-cube-stage]')
    const listEl = root.querySelector<HTMLElement>('[data-project-list]')
    const markerEl = root.querySelector<HTMLElement>('[data-project-marker]')
    const count = faces.length || CARDS
    const step = 360 / count
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const narrow = window.matchMedia('(width < 64rem)')

    let frame = 0
    let hero = true
    let shown = 0
    // The face the index has walked to. Only read where the scroll cannot turn
    // the box, which is where it is the ring's one driver.
    let picked = 0
    let wasStill = false
    // The deck's own place below `lg`, 0 across the first card to 1 across the
    // last: the deck in the flow reports where it has come to rest, and the rig
    // reads it as the same turn the ring takes from the page.
    let deckTurn = 0
    // The index's progress rule: where the first row's centre sits in the list,
    // how far the last one is from it, and the rule's own height. Measured per
    // layout — never per frame.
    let markStart = 0
    let markSpan = 0
    let markHeight = 0
    // How far the card must travel at the fold for its painted right edge — the
    // edge the reader sees, not the layout box that holds it — to sit on the
    // hero's right gutter. Measured per layout, never per frame.
    let foldX = 0
    // The page's own geometry: measured once per layout, never per frame.
    // `sectionTop` and `runway` price the pin; `viewport` scopes the rig to the
    // scroll range where it can change anything; `liftX` is the fold's horizontal
    // solve. `lift` is the flow relationship solved on the first visible frame.
    let sectionTop = 0
    let runway = 0
    let viewport = window.innerHeight
    let lift = 0
    let liftX = 0
    let liftReady = false
    let painted = false

    const stillMode = () => reduce.matches || narrow.matches

    // The list is layout, not scroll: it moves on a resize, on crossing `lg` and
    // once the fonts land, and the rig only reads the result.
    const measure = () => {
      // The card the reader sees is the front face's projection: the scene's
      // perspective widens it a little past the box that holds it. Probe the
      // ring square to the reader and shift it right by that overhang, so the
      // card, not the box under it, starts on the column's left edge. Narrow,
      // the card is centred in its column instead, so there is nothing to
      // correct; under reduced motion the box is a flat grid.
      if (cubeEl) {
        let overhang = 0

        if (!stillMode() && faces[0]) {
          cubeEl.style.setProperty('--rot', '0deg')
          cubeEl.style.setProperty('--cube-align', '0px')

          const box = cubeEl.getBoundingClientRect()
          const face = faces[0].getBoundingClientRect()
          // The face is projected about its own centre, so half the extra width
          // is the overhang. A translate inside the scene is magnified with it,
          // so the shift is that overhang over the magnification.
          const magnification = box.width > 0 ? face.width / box.width : 1
          overhang = magnification > 0 ? (face.width - box.width) / 2 / magnification : 0
          cubeEl.style.removeProperty('--rot')
        }

        cubeEl.style.setProperty('--cube-align', `${Math.max(0, overhang).toFixed(1)}px`)
      }

      // The card is read through the scene's own perspective: the front face
      // stands a depth in front of the page, so the card the reader sees is
      // wider than the box that holds it, and the fold's lean tips an edge away.
      // Probe it where the fold shows it — flight off, pose at `--p` 0, breath
      // still — and keep the distance from that right edge to the gutter. This
      // is a layout-time write, so the frame loop never pays for it.
      if (slot && liftEl && heroGutter) {
        const pose = liftEl.querySelector<HTMLElement>('[data-pose]')
        const transform = liftEl.style.transform
        const animation = pose?.style.animation ?? ''
        liftEl.style.transform = 'none'
        liftEl.style.setProperty('--p', '0')
        if (pose) pose.style.animation = 'none'
        const paintedBox = pose?.getBoundingClientRect()
        const gutter = heroGutter.getBoundingClientRect()
        liftEl.style.transform = transform
        liftEl.style.removeProperty('--p')
        if (pose) pose.style.animation = animation
        if (paintedBox && gutter.width > 0) foldX = gutter.right - paintedBox.right
      }

      // The page's scroll geometry: read here, never in `paint`.
      sectionTop = root.getBoundingClientRect().top + window.scrollY
      runway = root.offsetHeight - (stageEl?.offsetHeight ?? window.innerHeight)
      viewport = window.innerHeight
      liftX = foldX - (liftEl?.offsetWidth ?? 0) / 2
      // `lift` only exists while the slot is unpinned, so it is solved on the
      // first frame the flight is visible rather than here.
      liftReady = false

      if (!listEl || !markerEl) return

      const rows = listEl.querySelectorAll<HTMLElement>('[data-project-row]')
      if (rows.length === 0) return

      const list = listEl.getBoundingClientRect()
      const first = rows[0].getBoundingClientRect()
      const last = rows[rows.length - 1].getBoundingClientRect()
      const height = markerEl.offsetHeight
      if (list.height === 0 || height === 0) return

      markStart = first.top + first.height / 2 - list.top
      markSpan = last.top + last.height / 2 - (first.top + first.height / 2)
      markHeight = height
    }

    const paint = () => {
      frame = 0

      const scroll = window.scrollY
      const still = stillMode()

      // Crossing into a still mode keeps the face the reader is already on.
      if (still && !wasStill) picked = shown
      wasStill = still

      // Past the section the ring is on its last face and the card is home:
      // nothing the rig writes can change, so skip the page's heaviest repaint
      // instead of running it on every footer scroll. The mount paint always
      // runs, so a deep link still lands on the right face.
      if (painted && !narrow.matches && scroll > sectionTop + runway + viewport) return
      painted = true

      // The card is already home on a phone and under reduced motion: the
      // section is a flat grid there, so there is nothing to fly. Wide, the
      // flight is measured against the section's own top, so the card is on
      // its face at the stage's first pixel and not a fraction short of it.
      const flight = still ? 1 : clamp(scroll / Math.max(sectionTop, 1))
      // Below `lg` the deck's own scroll is the turn; wide, the page's is.
      const rawTurn = narrow.matches
        ? deckTurn
        : still || runway <= 0
          ? picked / Math.max(count - 1, 1)
          : clamp((scroll - sectionTop) / runway)
      // The detent shapes the turn, not the scroll: the ring holds a face while
      // the reader is near it and carries through between, so a stop lands on a
      // card while the document itself is never pulled.
      const turn = detent(rawTurn, count - 1)
      const turned = turn * (count - 1) * step

      // The card is centred on the hero's own centre line. The lift is a flow
      // relationship — the slot and the hero's centre move together until the
      // stage pins — so it is solved once per layout, on the first frame where
      // the flight is visible, and only read after that.
      if (!liftReady && flight < 1 && slot && liftEl && heroLine) {
        const slotBox = slot.getBoundingClientRect()
        const heroBox = heroLine.getBoundingClientRect()
        const cardTop = slotBox.top + liftEl.offsetTop
        lift = cardTop + liftEl.offsetHeight / 2 - (heroBox.top + heroBox.height / 2)
        liftReady = true
      }

      // The index's own progress: the rule travels from the first row's centre
      // to the last one's with the turn, so the column says how far round the
      // box is before a name has to be read.
      if (markerEl && markHeight > 0) {
        const mark = markStart - markHeight / 2 + turn * markSpan
        markerEl.style.transform = `translateY(${mark.toFixed(1)}px)`
      }

      // Written on the driven element, not the section: a frame of flight then
      // repaints the card instead of the header and every face of the box.
      const driven = liftEl ?? root
      driven.style.setProperty('--p', flight.toFixed(3))
      driven.style.setProperty('--rot', `${(-turned).toFixed(1)}deg`)

      driven.style.setProperty('--lift', `${lift.toFixed(1)}px`)
      driven.style.setProperty('--lift-x', `${liftX.toFixed(1)}px`)

      // The accent is the card that faces the reader, so it fades across the
      // turn instead of riding one face round the back of the box.
      for (const [index, face] of faces.entries()) {
        const facing = Math.cos(((index * step - turned) * Math.PI) / 180)
        const lit = clamp((facing - FADE_FROM) / (1 - FADE_FROM))
        face.style.setProperty('--lit', lit.toFixed(3))
      }

      const entry = Math.round(turn * (count - 1))
      if (entry !== shown) {
        shown = entry
        onEntryChange(entry)
      }

      const isHero = !still && flight < 1
      if (isHero !== hero) {
        hero = isHero
        onHeroChange(isHero)
      }
    }

    // Below `lg` the ring is a deck in the flow rather than a turn on a runway:
    // one card per screen, dragged by hand, with the platform's own scrolling
    // supplying the momentum and the snap. This reads where the deck has come to
    // rest — as a fraction of a card, so the accent still crosses the handover —
    // and hands the rig the same turn the page's scroll gives it wide.
    const deck = () => {
      if (!narrow.matches || !cubeEl || faces.length === 0) return

      const track = cubeEl.getBoundingClientRect()
      const centre = track.left + track.width / 2
      let nearest = 0
      let reach = Infinity
      let offset = 0

      faces.forEach((face, index) => {
        const box = face.getBoundingClientRect()
        const distance = box.left + box.width / 2 - centre
        if (Math.abs(distance) < Math.abs(reach)) {
          nearest = index
          reach = distance
          offset = box.width > 0 ? distance / box.width : 0
        }
      })

      deckTurn = clamp((nearest - offset) / Math.max(count - 1, 1))
      picked = nearest
      request()
    }

    // One face, from the index. Wide, the scroll is the ring's only driver, so a
    // row moves the page to that face's place in the runway; where the scroll
    // cannot turn the box, it moves the ring itself.
    goRef.current = (index: number) => {
      const current = stillMode() ? picked : shown
      const next = Math.min(Math.max(Math.round(index), 0), count - 1)
      if (next === current) return

      // Below `lg` the cards are a deck in the flow: a row walks it by scrolling
      // the deck itself, and the deck's own snap and momentum land the card.
      if (narrow.matches) {
        const face = faces[next]
        const track = cubeEl
        if (face && track) {
          const left = face.offsetLeft - (track.clientWidth - face.offsetWidth) / 2
          track.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' })
        }
        return
      }

      if (stillMode()) {
        // Drop a queued frame: this paint already carries the new face.
        if (frame !== 0) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
        picked = next
        paint()
        return
      }

      if (runway <= 0) return

      // Clamped into the page: the last face sits on the pin's final pixel, so
      // the target must never ask for more scroll than the document holds.
      const target = sectionTop + (next / Math.max(count - 1, 1)) * runway
      const reach = document.documentElement.scrollHeight - window.innerHeight
      scrollToY(Math.min(Math.max(target, 0), Math.max(reach, 0)))
    }

    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint)
    }

    const relayout = () => {
      measure()
      deck()
      request()
    }

    measure()
    deck()
    paint()

    if (document.fonts) void document.fonts.ready.then(relayout)
    cubeEl?.addEventListener('scroll', deck, { passive: true })
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', relayout, { passive: true })
    reduce.addEventListener('change', request)
    narrow.addEventListener('change', relayout)

    return () => {
      cubeEl?.removeEventListener('scroll', deck)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', relayout)
      reduce.removeEventListener('change', request)
      narrow.removeEventListener('change', relayout)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [rootRef, onHeroChange, onEntryChange])

  return { go: useCallback((index: number) => goRef.current(index), []) }
}

/**
 * Projects: one card per project on a Y ring, so the section is a single object
 * rather than a row of panels. It opens on the fold's card — the same element,
 * one screen above its place — and as the first screen of scroll runs out the
 * card settles into the front face and its pose goes with it. Then the box
 * turns backwards until the last card faces the reader, the accent passing from
 * face to face, and holds there.
 */
export function Projects() {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLElement>(null)
  const [inHero, setInHero] = useState(true)
  const [entry, setEntry] = useState(0)

  const { go } = useCubeScroll(rootRef, setInHero, setEntry)

  const labelKey = sections.find((section) => section.id === 'projects')?.labelKey

  return (
    <section id="projects" ref={rootRef} aria-label={labelKey && t(labelKey)} className="relative">
      <div className="h-[340svh] motion-reduce:h-auto max-lg:h-auto">
        <div
          data-cube-stage
          className="sticky top-0 flex h-svh flex-col motion-reduce:static motion-reduce:h-auto max-lg:static max-lg:h-auto"
        >
          {/* Below `lg` the stage is not pinned, so nothing fills a screen: the
              flex weights keep their `auto` size and the chapter is as tall as
              its own content. */}
          <div className="container-page flex min-h-0 flex-1 flex-col pt-24 pb-10 max-lg:flex-none md:pt-28">
            <div className="flex min-h-0 flex-1 flex-col max-lg:flex-none lg:grid lg:grid-cols-2 lg:gap-x-(--seam)">
              <div className="relative flex flex-col">
                <SectionHeader heading={t('projects.heading')} />
                <p className="section-lead mt-6">{t('projects.lead')}</p>

                {/* The box's index and its only control: a row per project, each
                    a step to that card, with one accent rule that travels down
                    the list as the ring turns. Wide it walks the ring; below
                    `lg` it walks the deck, so the chapter keeps a named step to
                    every card and every card's link stays reachable. */}
                <ol
                  data-project-list
                  className="relative mt-8 lg:absolute lg:inset-x-0 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2"
                >
                  <li aria-hidden="true" className="pointer-events-none absolute top-0 left-0">
                    <span
                      data-project-marker
                      className="block h-lh w-0.5 bg-accent text-body motion-reduce:hidden"
                    />
                  </li>
                  {featuredRepos.map((repo, index) => (
                    <li key={repo.name}>
                      <button
                        type="button"
                        data-project-row
                        onClick={() => go(index)}
                        aria-current={index === entry ? 'true' : undefined}
                        className={`press grid w-full cursor-pointer grid-cols-[2rem_1fr] items-baseline gap-3 py-2 pl-5 text-left transition-[color] duration-200 ease-out motion-reduce:transition-none lg:py-3 ${
                          index === entry ? 'text-foreground' : 'text-muted hover-fine:text-foreground'
                        }`}
                      >
                        <span className="label tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-body">{repo.name}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* The lift sits outside the scene's perspective, so the flight is
                  a plain move in the page's plane: the card cannot be scaled
                  or skewed on its way into the cube. At rest the box hangs from
                  its column's left edge, the body axis the heading sits on. */}
              <div
                data-cube-slot
                className="relative flex min-h-0 flex-1 items-center justify-center max-lg:mt-8 max-lg:flex-none @container lg:justify-start"
              >
                <div data-cube-lift className="cube-lift">
                  <div
                    className="cube-scene"
                    style={
                      {
                        '--cube-step': `${CUBE_STEP}deg`,
                        '--cube-r': CUBE_R
                      } as CSSProperties
                    }
                  >
                    <div data-cube className="cube">
                      {featuredRepos.map((repo, index) => (
                        <div
                          key={repo.name}
                          data-face={index}
                          className="cube-face"
                          style={
                            {
                              '--i': index,
                              // Until the rig paints, only the fold's card is lit.
                              '--lit': index === 0 ? 1 : 0
                            } as CSSProperties
                          }
                        >
                          <ProjectCard
                            repo={repo}
                            index={index}
                            inHero={inHero}
                            current={index === entry}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
