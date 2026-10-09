import { FaGithub } from 'react-icons/fa'
import { LuBriefcase, LuContact, LuExternalLink, LuMapPin } from 'react-icons/lu'
import { useMemo, useRef, useState } from 'react'
import { Trans } from 'react-i18next'
import { cn } from '@/lib/utils'
import { highlightComponents } from '@/lib/trans'
import { GITHUB_USERNAME } from '../data'
import { useRafScroll } from '../hooks/useRafScroll'
import { useTranslation } from '../i18n/i18n'

export function Hero() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const parallax = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches,
    []
  )

  useRafScroll((scrollY) => {
    setScrolled(scrollY > 60)

    if (!parallax) return

    const content = contentRef.current
    if (!content) return

    // Content drifts down slower than the page and fades out as it leaves
    const progress = Math.min(scrollY / window.innerHeight, 1)
    content.style.transform = `translate3d(0, ${(scrollY * 0.18).toFixed(1)}px, 0)`
    content.style.opacity = String(Math.max(0, 1 - progress * 1.25))
  })

  return (
    <section
      id={'hero'}
      className={'relative flex min-h-screen flex-col justify-center overflow-hidden'}
    >
      <div ref={contentRef} className={'relative container-page pt-32 pb-24'}>
        {/* Brand mark */}
        <div
          className={
            'flex items-baseline font-display text-display font-black tracking-display select-none'
          }
        >
          {/* Fixed first slash */}
          <span className={'inline-block text-accent'}>/</span>

          {/* Moving slash + wordmark */}
          <span className={'relative inline-block'}>
            {/* Reserve exactly one slash width */}
            <span className={'invisible inline-block w-[0.45em]'}>/</span>

            {/* Wordmark */}
            <span
              className={
                'inline-block whitespace-nowrap text-foreground motion-safe:animate-name-reveal'
              }
            >
              <span className={'wordmark-sheen pr-1'}>RMCKR</span>
            </span>

            {/* Moving slash */}
            <span
              className={
                'absolute inset-y-0 left-0 z-10 inline-block text-accent motion-safe:animate-slash-reveal'
              }
            >
              /
            </span>
          </span>
        </div>

        {/* Tagline */}
        <p
          className={
            'mb-8 max-w-2xl text-lead text-muted [--delay:1.8s] motion-safe:animate-fade-up'
          }
        >
          <Trans i18nKey={'hero.tagline'} components={highlightComponents} />
        </p>

        {/* Meta row */}
        <div
          className={
            'mb-12 flex min-h-10 max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 meta [--delay:2.1s] motion-safe:animate-fade-up'
          }
        >
          <span className={'flex items-start gap-2'}>
            <LuMapPin className={'mt-0.5 shrink-0 text-accent'} />
            <span>{t('hero.location')}</span>
          </span>

          <span className={'flex items-start gap-2'}>
            <LuBriefcase className={'mt-0.5 shrink-0 text-accent'} />
            <span>{t('hero.status')}</span>
          </span>

          <span className={'flex items-start gap-2'}>
            <LuContact className={'mt-0.5 shrink-0 text-accent'} />
            <span>{t('hero.avail')}</span>
          </span>
        </div>

        {/* CTAs */}
        <div className={'flex flex-wrap gap-4 [--delay:2.35s] motion-safe:animate-fade-up'}>
          <a href={'#about'} className={'btn-primary btn-lg'}>
            {t('hero.viewPortfolio')}
          </a>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target={'_blank'}
            rel={'noreferrer'}
            className={'btn-secondary'}
          >
            <FaGithub size={14} />
            {t('hero.github')}
            <LuExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 meta transition-all duration-500',
          scrolled ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        )}
      >
        <span>{t('hero.scroll')}</span>
        <div className={'h-12 w-px bg-linear-to-b from-muted to-transparent'} />
      </div>
    </section>
  )
}
