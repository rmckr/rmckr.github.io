import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue
} from 'motion/react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { FaGithub } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import {
  LuChevronLeft,
  LuChevronRight,
  LuExternalLink,
  LuFileWarning,
  LuGitFork,
  LuGitPullRequest,
  LuImageOff,
  LuMapPin,
  LuStar,
  LuUsersRound
} from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'
import { featuredRepos, GITHUB_USERNAME } from '../data'
import type { GHRepo } from '../data/github'
import { loadGitHub, type GitHubData } from '../data/loadGitHub'
import { PIN_PX, usePinStage } from '../hooks/usePinStage'
import { useWide } from '../hooks/useWide'
import { useTranslation } from '../i18n/i18n'
import { Counter } from './Counter'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── GitHub section ────────────────────────────────────────────────────────────
// Projects first, profile and stats last. On wide screens with motion allowed
// the projects live in a pinned stage (same grammar as Experience): scroll
// scrubs one project slide at a time — a screenshot carousel with a readout
// column, stacked as a card pile that promotes one card per segment. A
// clickable rail of project names marks where you are and jumps the scroll.
// Everywhere else the same cards render as a static grid, so content never
// depends on the animation.

/** Two-digit count for the slide counter. */
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Front card's drift across its segment, px — pairs with the stage grid's
    `mt-16` top gap (keep cards clear of the header). */
const DRIFT = 36
/** Scale the front card gains across its segment as it lifts off its stack. */
const GROW = 0.03
/** Upcoming cards waiting behind the front one — peek px, scale and opacity
    steps per stack layer. */
const STACK_LAYERS = 2
const STACK_PEEK = 14
const STACK_SCALE = 0.03
const STACK_DIM = 0.3
/** Px a passed card rises as it fades out of the front slot. */
const EXIT_RISE = 24

/** The scrub only runs where the stage fits its side rail. */
const WIDE_MQ = '(min-width: 1024px)'

/** Hand-picked config per repo, keyed by name (filler repos get none). */
const featuredByName = new Map(featuredRepos.map((pick) => [pick.name, pick]))

// ── Carousel ──────────────────────────────────────────────────────────────────
// Crossfading screenshots with prev/next, dots and a counter. Images cover
// and crop at the edges (no letterboxing); a failed image drops out and the
// last one leaves a placeholder.

/** Shared shell for the carousel arrows — the side class stays literal at
    each call site so Tailwind can scan it. */
const NAV_BTN =
  'absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center border border-subtle bg-bg/75 text-muted transition-[color_200ms_ease-out,transform_160ms_ease-out,scale_160ms_ease-out] hover-fine:text-foreground active:scale-[0.97]'

type CarouselProps = {
  images: string[]
  alt: string
}

function Carousel({ images, alt }: CarouselProps) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const [broken, setBroken] = useState<string[]>([])
  const [step, setStep] = useState(0)

  const slides = images.filter((src) => !broken.includes(src))

  if (slides.length === 0) {
    return (
      <div className={'absolute inset-0 flex flex-col items-center justify-center gap-3 p-6'}>
        <LuImageOff size={22} aria-hidden={'true'} className={'text-muted'} />
        <p className={'meta text-center'}>{t('github.noScreenshot')}</p>
      </div>
    )
  }

  const at = ((step % slides.length) + slides.length) % slides.length
  const go = (delta: number) => setStep((v) => v + delta)

  return (
    <div className={'absolute inset-0'}>
      <AnimatePresence initial={false}>
        <motion.img
          key={slides[at]}
          src={slides[at]}
          alt={alt}
          draggable={false}
          onError={() =>
            setBroken((prev) =>
              prev.includes(slides[at]) ? prev : [...prev, slides[at]]
            )
          }
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
          className={'absolute inset-0 size-full object-cover object-center'}
        />
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            type={'button'}
            onClick={() => go(-1)}
            aria-label={t('github.prevImage')}
            className={`${NAV_BTN} left-2`}
          >
            <LuChevronLeft size={15} />
          </button>

          <button
            type={'button'}
            onClick={() => go(1)}
            aria-label={t('github.nextImage')}
            className={`${NAV_BTN} right-2`}
          >
            <LuChevronRight size={15} />
          </button>

          <span
            className={'absolute bottom-2 left-3 font-mono text-2xs text-muted tabular-nums'}
            aria-hidden={'true'}
          >
            {`${pad2(at + 1)}/${pad2(slides.length)}`}
          </span>

          <div className={'absolute inset-x-0 bottom-1.5 z-10 flex items-center justify-center'}>
            {slides.map((src, i) => (
              <button
                key={src}
                type={'button'}
                onClick={() => setStep(i)}
                aria-label={`${t('github.image')} ${i + 1}`}
                aria-current={i === at}
                className={'grid size-6 place-items-center'}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full transition-colors duration-200',
                    i === at ? 'bg-accent' : 'bg-subtle hover-fine:bg-foreground/40'
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────────────
// One repo as a flat panel: screenshot carousel + readout column. The same
// card is the scrubbed stage's slide and the static grid's tile, so a
// project looks identical whether the scrub runs or not.

type ProjectCardProps = {
  repo: GHRepo
  images: string[]
}

function ProjectCard({ repo, images }: ProjectCardProps) {
  const { t } = useTranslation()

  return (
    <article className={'card flex h-full flex-col bg-surface sm:flex-row'}>
      {/* Fixed 16:10 frame when stacked; stretches to the card's height at sm+ */}
      <div
        className={
          'relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:min-h-52 sm:flex-1'
        }
      >
        <Carousel images={images} alt={repo.name} />
      </div>

      <div
        className={
          'flex w-full shrink-0 flex-col gap-3 border-t border-subtle p-5 sm:w-72 sm:border-t-0 sm:border-l'
        }
      >
        <h3 className={'truncate text-2xl'}>{repo.name}</h3>

        <p className={'text-sm/relaxed text-muted'}>
          {repo.description ?? t('github.noDescription')}
        </p>

        <div className={'mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 meta'}>
          {repo.language && (
            <span className={'label border border-subtle px-2 py-0.5 text-2xs'}>
              {repo.language}
            </span>
          )}

          <span className={'flex items-center gap-1.5'}>
            <LuStar size={13} aria-hidden={'true'} />
            {repo.stargazers_count}
          </span>

          <span className={'flex items-center gap-1.5'}>
            <LuGitFork size={13} aria-hidden={'true'} />
            {repo.forks_count}
          </span>
        </div>

        <a
          href={repo.html_url}
          target={'_blank'}
          rel={'noreferrer'}
          className={'group btn-secondary mt-1 self-start'}
        >
          {t('github.viewRepo')}
          <LuExternalLink className={'icon-nudge'} />
        </a>
      </div>
    </article>
  )
}

// ── Segment build-up ───────────────────────────────────────────────────────────
// Scroll-driven half of the front card's choreography: it accrues DRIFT and
// GROW across its own segment of runway progress (clamped 0 → 1) so the
// hard switch lands at the peak of a visible build. MUST be a motion.div:
// MotionValues in `style` only apply on motion components.

type SegmentBuildProps = {
  /** This card's segment: progress in [index/count, (index+1)/count]. */
  index: number
  count: number
  /** Runway scrub progress. */
  progress: MotionValue<number>
  children: ReactNode
}

function SegmentBuild({ index, count, progress, children }: SegmentBuildProps) {
  // Segment-local progress, 0 → 1 across exactly this card's segment —
  // the same floor() mapping the active index and switch use.
  const build = useTransform(progress, (v) =>
    Math.min(1, Math.max(0, v * count - index))
  )
  const y = useTransform(build, [0, 1], [0, -DRIFT])
  const scale = useTransform(build, [0, 1], [1, 1 + GROW])

  return (
    <motion.div className={'size-full'} style={{ y, scale }}>
      {children}
    </motion.div>
  )
}

// ── Index rail ─────────────────────────────────────────────────────────────────
// The scrubbed stage's table of contents: one clickable line per repo; a
// click runs the scrub's mapping in reverse and scrolls to that project's
// slice of the runway.

type IndexRailProps = {
  repos: GHRepo[]
  active: number
  /** Scroll the runway so this project becomes the active slide. */
  onSelect: (index: number) => void
}

function IndexRail({ repos, active, onSelect }: IndexRailProps) {
  return (
    <ol className={'flex flex-col justify-center'}>
      {repos.map((repo, i) => (
        <li key={repo.id}>
          <button
            type={'button'}
            onClick={() => onSelect(i)}
            aria-current={i === active ? 'true' : undefined}
            className={cn(
              'relative flex w-full items-baseline gap-3 py-1.5 pl-6 text-left transition-colors duration-300 hover-fine:text-foreground',
              i === active ? 'text-foreground' : 'text-muted'
            )}
          >
            {/* Accent tick slides out of the left edge on the active line */}
            <span
              aria-hidden={'true'}
              className={cn(
                'absolute top-1/2 left-0 h-px w-3 origin-left -translate-y-1/2 bg-accent transition-transform duration-300 ease-out-expo motion-reduce:transition-none',
                i === active ? 'scale-x-100' : 'scale-x-0'
              )}
            />

            <span
              className={
                'min-w-0 truncate font-display text-xl/tight font-extrabold uppercase tracking-wide'
              }
            >
              {repo.name}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────────────
// One readout of the stats row: giant numeral, accent hairline, icon + label.

type StatProps = {
  label: string
  value: number
  icon: IconType
}

function Stat({ label, value, icon: Icon }: StatProps) {
  return (
    <div className={'flex flex-col items-center gap-3'}>
      <p
        className={
          'font-display text-6xl leading-none font-extrabold tracking-display tabular-nums text-accent lg:text-7xl'
        }
      >
        <Counter value={value} />
      </p>

      <span className={'h-px w-16 bg-accent'} aria-hidden={'true'} />

      <p className={'meta label flex items-center gap-1.5 text-2xs'}>
        <Icon size={13} aria-hidden={'true'} />
        {label}
      </p>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GitHubSection() {
  const { t } = useTranslation()
  const wide = useWide(WIDE_MQ)
  const reduce = useReducedMotion()

  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(0)

  const request = useCallback((force = false) => loadGitHub(force), [])

  const apply = useCallback((result: GitHubData): void => {
    setData(result)
    setLoading(false)
  }, [])

  const fail = useCallback((): void => {
    setError(true)
    setLoading(false)
  }, [])

  // The rule allows setState in promise callbacks, not in the effect body itself.
  useEffect(() => {
    request().then(apply, fail)
  }, [request, apply, fail])

  // The scrub only runs wide + motion-allowed; the pin recipe itself lives
  // in usePinStage (shared with Experience).
  const scrub = wide && !reduce
  const { runwayRef, stageRef, stageH, scrollYProgress, runwayHeight } = usePinStage(scrub)

  // Floor of progress × count = the open slat — the same mapping each
  // SegmentBuild scrubs from, so card, rail and switch can't disagree.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!scrub || !data || data.repos.length === 0) return
    const idx = Math.min(
      data.repos.length - 1,
      Math.max(0, Math.floor(p * data.repos.length))
    )
    setActive((cur) => (cur === idx ? cur : idx))
  })

  // Clamp for repos lists shorter than the pick (renamed/deleted repos).
  const openAt = data ? Math.min(active, data.repos.length - 1) : 0

  // Clicking a rail line runs the scrub's mapping in reverse: land mid-way
  // through that project's segment (html's smooth scroll animates it).
  const goToProject = useCallback(
    (i: number) => {
      const el = runwayRef.current
      if (!el || !data || data.repos.length === 0) return
      // Pin-to-release range: runway height minus the stage's measured height.
      const range = el.offsetHeight - stageH
      if (range <= 0) return
      const top = el.getBoundingClientRect().top + window.scrollY - PIN_PX
      window.scrollTo({ top: top + ((i + 0.5) / data.repos.length) * range })
    },
    [data, stageH]
  )

  // marginBottom holds the stats below the fold for the whole pin: at release
  // the stage's bottom sits PIN_PX + stageH from the viewport top, so the
  // stats need exactly (100svh − that) of gap to still be off-screen. Margin,
  // not runway height: growing the runway would slow the scrub and move the
  // release point.
  const runway = {
    height: runwayHeight(data?.repos.length ?? 0),
    marginBottom:
      stageH > 0 ? `max(0px, calc(100svh - ${PIN_PX}px - ${stageH}px))` : undefined
  }

  return (
    <Section id={'github'}>
      {/* ── Projects: pinned slide stage, scrubbed by vertical scroll ── */}
      <div ref={runwayRef} style={scrub ? runway : undefined}>
        <div
          ref={stageRef}
          className={cn(
            'stagger',
            // Same pin recipe as Experience's stage (usePinStage + top-32).
            scrub ? 'sticky top-32 flex flex-col' : ''
          )}
        >
          <SectionHeader label={t('github.label')} heading={t('github.heading')} />

          {loading && (
            <div className={'flex justify-center py-20'}>
              <div
                className={'size-5 animate-spin rounded-full border-2 border-subtle border-t-accent'}
              />
            </div>
          )}

          {error && (
            <div
              className={'flex items-center justify-between gap-4 border-y border-subtle p-4 font-mono text-accent'}
            >
              <span>{t('github.error')}</span>

              <button
                type={'button'}
                onClick={() => {
                  setLoading(true)
                  setError(false)
                  request(true).then(apply, fail)
                }}
                className={'btn-secondary shrink-0'}
              >
                {t('github.retry')}
              </button>
            </div>
          )}

          {data && scrub && data.repos.length > 0 && (
            <div className={'mt-16 grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]'}>
              <IndexRail
                repos={data.repos}
                active={openAt}
                onSelect={goToProject}
              />

              {/* The card stack: every repo mounted, positioned by its
                  distance k from the open one — front (k = 0) builds, the
                  next STACK_LAYERS wait behind, passed cards rise and fade.
                  The switch is just openAt moving. */}
              <div className={'relative h-[20rem]'}>
                {data.repos.map((repo, i) => {
                  const k = i - openAt
                  const behind = k > 0 && k <= STACK_LAYERS
                  const stack =
                    k === 0
                      ? { y: 0, scale: 1, opacity: 1 }
                      : behind
                        ? {
                            y: k * STACK_PEEK,
                            scale: 1 - k * STACK_SCALE,
                            opacity: 1 - k * STACK_DIM
                          }
                        : { y: -EXIT_RISE, scale: 1, opacity: 0 }

                  return (
                    <motion.div
                      key={repo.id}
                      className={'absolute inset-0'}
                      style={{ zIndex: k === 0 ? 3 : behind ? 2 : 1 }}
                      animate={stack}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                    >
                      <SegmentBuild
                        index={i}
                        count={data.repos.length}
                        progress={scrollYProgress}
                      >
                        <ProjectCard
                          repo={repo}
                          images={featuredByName.get(repo.name)?.images ?? []}
                        />
                      </SegmentBuild>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {data && !scrub && (
            // Same cards, static grid — no pin, no scrub, everything readable.
            <div className={'grid items-stretch gap-6 md:grid-cols-2'}>
              {data.repos.map((repo) => (
                <ProjectCard
                  key={repo.id}
                  repo={repo}
                  images={featuredByName.get(repo.name)?.images ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats readout + profile byline — after the projects ──
          mt-24 is the shared projects→stats gap; on the pinned path it is a
          sibling margin that collapses with the runway's fold-hold. */}
      {!loading && !error && data && (
        <div className={'mt-24 flex flex-col gap-14 stagger'}>
          <div className={'grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-14'}>
            <Stat label={t('github.stats.stars')} value={data.totalStars} icon={LuStar} />
            <Stat label={t('github.stats.forks')} value={data.totalForks} icon={LuGitFork} />
            <Stat
              label={t('github.stats.pullRequests')}
              value={data.prCount}
              icon={LuGitPullRequest}
            />
            <Stat
              label={t('github.stats.issues')}
              value={data.issueCount}
              icon={LuFileWarning}
            />
          </div>

          <div className={'card flex flex-col gap-5 bg-surface p-6 sm:p-8'}>
            <div className={'flex flex-wrap items-center gap-x-6 gap-y-4'}>
              <div className={'flex items-center gap-4'}>
                <img
                  src={data.user.avatar_url}
                  alt={data.user.name ?? data.user.login}
                  className={'size-16 shrink-0 rounded-full border border-subtle'}
                />

                <div className={'min-w-0'}>
                  <p
                    className={'truncate font-display text-2xl/tight font-extrabold text-foreground'}
                  >
                    {data.user.name ?? GITHUB_USERNAME}
                  </p>

                  <p className={'truncate font-mono text-xs text-accent'}>@{data.user.login}</p>
                </div>
              </div>

              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target={'_blank'}
                rel={'noreferrer'}
                className={'group btn-secondary ml-auto'}
              >
                <FaGithub size={14} />
                {t('github.viewProfile')}
                <LuExternalLink className={'icon-nudge'} />
              </a>
            </div>

            {data.user.bio && (
              <p className={'max-w-2xl text-sm/relaxed text-muted'}>{data.user.bio}</p>
            )}

            {(data.user.followers > 0 || data.user.location) && (
              <div className={'flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-subtle pt-5 meta'}>
                {data.user.followers > 0 && (
                  <span className={'flex items-center gap-1.5'}>
                    <LuUsersRound size={14} aria-hidden={'true'} />
                    <span>
                      <Counter value={data.user.followers} /> {t('github.followers')}
                    </span>
                  </span>
                )}

                {data.user.location && (
                  <span className={'flex items-center gap-1.5'}>
                    <LuMapPin size={14} aria-hidden={'true'} />
                    {data.user.location}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}
