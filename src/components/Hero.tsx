import { FaGithub } from 'react-icons/fa'
import { LuBriefcase, LuContact, LuExternalLink, LuMapPin } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { cn } from '@/lib/utils'
import { highlightComponents } from '@/lib/trans'
import { GITHUB_USERNAME } from '../data'
import { useTranslation } from '../i18n/i18n'

export function Hero() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id={'hero'} className={'relative min-h-screen flex flex-col justify-center grid-bg overflow-hidden'}>
      {/* Background radial glow */}
      <div className={'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 rounded-full pointer-events-none glow-accent'}/>

      <div className={'relative container-page pt-32 pb-24'}>
        {/* Brand mark */}
        <div className={'flex items-baseline select-none font-display font-black tracking-display text-display'}>
          {/* Fixed first slash */}
          <span className={'inline-block text-accent'}>/</span>

          {/* Moving slash + wordmark */}
          <span className={'relative inline-block'}>
            {/* Reserve exactly one slash width */}
            <span className={'invisible inline-block w-[0.45em]'}>/</span>

            {/* Wordmark */}
            <span className={'inline-block whitespace-nowrap text-foreground pr-1 motion-safe:animate-name-reveal'}>
              RMCKR
            </span>

            {/* Moving slash */}
            <span className={'absolute inset-y-0 left-0 z-10 inline-block text-accent motion-safe:animate-slash-reveal'}>
              /
            </span>
          </span>
        </div>

        {/* Tagline */}
        <p className={'max-w-2xl mb-8 text-lead text-muted motion-safe:animate-fade-up [--delay:1.8s]'}>
          <Trans i18nKey={'hero.tagline'} components={highlightComponents}/>
        </p>

        {/* Meta row */}
        <div className={'meta min-h-10 max-w-2xl flex flex-wrap gap-x-4 gap-y-2 mb-12 items-center motion-safe:animate-fade-up [--delay:2.1s]'}>
          <span className={'flex items-start gap-2'}>
            <LuMapPin className={'shrink-0 mt-0.5 text-accent'}/>
            <span>{t('hero.location')}</span>
          </span>

          <span className={'flex items-start gap-2'}>
            <LuBriefcase className={'shrink-0 mt-0.5 text-accent'}/>
            <span>{t('hero.status')}</span>
          </span>

          <span className={'flex items-start gap-2'}>
            <LuContact className={'shrink-0 mt-0.5 text-accent'}/>
            <span>{t('hero.avail')}</span>
          </span>
        </div>

        {/* CTAs */}
        <div className={'flex flex-wrap gap-4 motion-safe:animate-fade-up [--delay:2.35s]'}>
          <a href={'#about'} className={'btn-primary btn-lg'}>
            {t('hero.viewPortfolio')}
          </a>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target={'_blank'}
            rel={'noreferrer'}
            className={'btn-secondary'}
          >
            <FaGithub size={14}/>
            {t('hero.github')}
            <LuExternalLink size={10}/>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          'meta absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500',
          scrolled ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        )}
      >
        <span>{t('hero.scroll')}</span>
        <div className={'w-px h-12 bg-linear-to-b from-muted to-transparent'}/>
      </div>
    </section>
  )
}
