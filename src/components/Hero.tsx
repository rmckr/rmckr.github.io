import { highlightComponents } from '@/lib/trans'
import { EASE } from '@/lib/motion'
import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from 'motion/react'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { Trans } from 'react-i18next'
import { FaGithub } from 'react-icons/fa'
import { LuBriefcase, LuContact, LuExternalLink, LuMapPin } from 'react-icons/lu'
import { GITHUB_USERNAME } from '../data'
import { useTranslation } from '../i18n/i18n'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// "//RMCKR" — two accent slashes followed by the name. id: stable list key
// (chars repeat: two slashes, two R's).
const GLYPHS: readonly { id: string; char: string; slash?: boolean }[] = [
  { id: 'slash-1', char: '/', slash: true },
  { id: 'slash-2', char: '/', slash: true },
  { id: 'R-1', char: 'R' },
  { id: 'M', char: 'M' },
  { id: 'C', char: 'C' },
  { id: 'K', char: 'K' },
  { id: 'R-2', char: 'R' }
]

const CENTRE = (GLYPHS.length - 1) / 2

/**
 * One glyph. Scroll-scrubbed separation: local progress runs ahead of the
 * global one, outer glyphs lead, each glyph spreads outward, rises and tips
 * back while heating toward the accent — a pre-painted hot copy cross-faded
 * in by opacity (see .glyph-hot in index.css).
 * On top sits the one-shot staggered load-in rise.
 */
function Glyph({
  char,
  slash,
  i,
  p
}: {
  char: string
  slash?: boolean
  i: number
  p: MotionValue<number>
}) {
  const c = Math.abs(i - CENTRE)
  const reduce = useReducedMotion()

  const lp = useTransform(p, (v) => clamp01(v * 1.45 - (3 - c) * 0.07))
  const x = useTransform(lp, (v) => `${(v * (i - CENTRE) * 5.2).toFixed(3)}vw`)
  const y = useTransform(lp, (v) => `${(v * -4.5).toFixed(3)}vh`)
  const rotateX = useTransform(lp, (v) => `${(v * 56).toFixed(3)}deg`)

  return (
    <motion.span
      /* '!' keeps the '//' accent — .glyph itself no longer paints colour */
      className={slash ? 'glyph text-accent!' : 'glyph'}
      style={reduce ? undefined : { x, y, rotateX }}
    >
      <motion.span
        /* Both copies share one grid cell, so the hot copy overlays the cold
           one exactly without growing the glyph's box */
        className={'grid *:[grid-area:1/1]'}
        initial={{ y: '116%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.25, delay: c * 0.09 + 0.1, ease: EASE }}
      >
        <span>{char}</span>
        {/* Painted once at full heat; scrubbing its opacity is
            composite-only, so scrolling never repaints the glyph */}
        {!reduce && (
          <motion.span aria-hidden={'true'} className={'glyph-hot'} style={{ opacity: lp }}>
            {char}
          </motion.span>
        )}
      </motion.span>
    </motion.span>
  )
}

export function Hero() {
  const { t } = useTranslation()
  const trackRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const motionOk = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches,
    []
  )

  // Scroll progress through the pinned track (0 → 1): from the hero's top
  // hitting the viewport's top to its bottom leaving it — i.e. the exact
  // moment the next section fills the screen, so the dissolve hands off there
  // with nothing left to overlap. ('end end' finished one viewport early;
  // the old negative margin existed to cover that gap.) The travel is still
  // two viewports, so every scrub-driven beat keeps its pacing.
  const { scrollYProgress: p } = useScroll({
    target: trackRef,
    offset: ['start start', 'end start']
  })

  // Hand-off phase (the pin's dissolve over the last 15% of the track):
  // also the next section's fade-in value, see applyHandoff below.
  const pinOpacity = useTransform(p, (v) => 1 - clamp01((v - 0.85) / 0.15))

  // Hand-off wiring. --p3 is written directly onto the section that follows
  // the hero (scoped next to the pin) — never as an inherited variable on
  // <html>, which would re-run style recalc for the whole document every
  // scroll frame. The nav threshold rides on the same value, and
  // data-hero-gone retires the fixed pin overlay once the hand-off completes
  // (else it would keep swallowing clicks over the next section). Reduced
  // motion sets none of them.
  const applyHandoff = useCallback((v: number) => {
    const p3 = clamp01((v - 0.85) / 0.15)
    const next = trackRef.current?.nextElementSibling
    if (next instanceof HTMLElement) next.style.setProperty('--p3', p3.toFixed(4))
    document.documentElement.toggleAttribute('data-hero-done', v >= 0.95)
    document.documentElement.toggleAttribute('data-hero-gone', v >= 0.999)
  }, [])

  // The change event only fires when the value moves, so the mount write
  // settles the initial value before first paint (the CSS fallback holds the
  // next section invisible until then); it also covers a page restored
  // mid-track where the first measured value is already non-zero.
  useLayoutEffect(() => {
    if (motionOk) applyHandoff(p.get())
  }, [motionOk, applyHandoff, p])

  useMotionValueEvent(p, 'change', (v) => {
    if (!motionOk) return
    applyHandoff(v)
  })

  // Pass-through: the wordmark flies through the camera over the last 45%
  const p2 = useTransform(p, (v) => clamp01((v - 0.55) / 0.45))
  const wordScale = useTransform(p2, (v) => 1 + v * 1.15)
  const wordY = useTransform(p2, (v) => `${(v * -3).toFixed(2)}vh`)
  const wordOpacity = useTransform(p2, (v) => 1 - v)

  // HUD lifts away in the ignition phase; the prompt fades almost at once
  const hudOpacity = useTransform(p, (v) => Math.max(0, 1 - v * 3.4))
  const hudY = useTransform(p, (v) => `${(v * 5).toFixed(2)}vh`)
  const promptOpacity = useTransform(p, (v) => Math.max(0, 1 - v * 6))

  return (
    <MotionConfig reducedMotion={'user'}>
      <section id={'hero'} ref={trackRef} className={'hero'}>
        {/* Fixed stage: overlays the viewport for the whole track — no sticky
            release, so the hero's box can end where the next section begins */}
        {/* Dissolves over the last 15% — an inline Motion opacity on this
            one element: no inherited variable, no document-wide invalidation */}
        <div className={'hero-pin'} style={reduce ? undefined : { opacity: pinOpacity }}>
          <div className={'hero-stage'}>
            <motion.h1
              className={'hero-word'}
              aria-label={'RMCKR'}
              style={reduce ? undefined : { scale: wordScale, y: wordY, opacity: wordOpacity }}
            >
              {GLYPHS.map((glyph, i) => (
                <Glyph key={glyph.id} char={glyph.char} slash={glyph.slash} i={i} p={p} />
              ))}
            </motion.h1>{' '}
            <motion.div
              className={'self-center'}
              initial={{ opacity: 0, y: '1.5rem' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
            >
              <motion.div
                className={'hero-scroll'}
                style={reduce ? undefined : { opacity: promptOpacity }}
              >
                <span>{t('hero.scroll')}</span>
                {/* Plain CSS loop (index.css): off the main thread, and it
                    pauses itself under reduced motion */}
                <span className={'hero-scroll-line'} aria-hidden={'true'} />
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll-lock meter: how far through the sequence the user has scrubbed */}
          <div className={'hero-meter'} aria-hidden={'true'}>
            <motion.div className={'hero-meter-fill'} style={reduce ? undefined : { scaleX: p }} />
          </div>

          <motion.div
            className={'hero-hud'}
            style={reduce ? undefined : { opacity: hudOpacity, y: hudY }}
          >
            <motion.div
              className={'hero-hud-in'}
              initial={{ opacity: 0, y: '2rem' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85, ease: EASE }}
            >
              <p className={'hero-tagline'}>
                <Trans i18nKey={'hero.tagline'} components={highlightComponents} />
              </p>

              <ul className={'flex flex-col gap-2 meta'}>
                <li className={'flex items-center gap-2'}>
                  <LuMapPin size={13} className={'shrink-0 text-accent'} />
                  {t('hero.location')}
                </li>
                <li className={'flex items-center gap-2'}>
                  <LuBriefcase size={13} className={'shrink-0 text-accent'} />
                  {t('hero.status')}
                </li>
                <li className={'flex items-center gap-2'}>
                  <LuContact size={13} className={'shrink-0 text-accent'} />
                  {t('hero.avail')}
                </li>
              </ul>

              <div className={'flex flex-wrap gap-3 min-[1100px]:justify-end'}>
                {/* data-scroll-duration hands this click to useSmoothScroll:
                    a paced 2.5s ride through the scrub, not the browser's jump */}
                <a href={'#about'} className={'btn-primary'} data-scroll-duration={'2.5'}>
                  {t('hero.viewPortfolio')}
                </a>
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target={'_blank'}
                  rel={'noreferrer'}
                  className={'btn-secondary'}
                >
                  <FaGithub size={13} />
                  {t('hero.github')}
                  <LuExternalLink size={9} />
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Corner framing */}
          <span aria-hidden={'true'} className={'pointer-events-none absolute inset-0'}>
            <span className={'absolute top-4 left-5 size-3.5 border-t border-l border-accent/70'} />
            <span
              className={'absolute top-4 right-5 size-3.5 border-t border-r border-foreground/35'}
            />
            <span
              className={'absolute bottom-4 left-5 size-3.5 border-b border-l border-foreground/35'}
            />
            <span
              className={
                'absolute right-5 bottom-4 size-3.5 border-r border-b border-foreground/35'
              }
            />
          </span>
        </div>
      </section>
    </MotionConfig>
  )
}
