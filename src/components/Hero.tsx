import { FaGithub } from 'react-icons/fa'
import { LuBriefcase, LuContact, LuExternalLink, LuMapPin } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
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
    <section id={'hero'} className={'[counter-increment:none]! relative min-h-screen flex flex-col justify-center grid-bg overflow-hidden'}>
      {/* Background radial glow — dynamic value, inline style is correct here */}
      <div
        className={'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full pointer-events-none'}
        style={{ background: 'radial-gradient(circle, rgba(229,53,53,0.07) 0%, transparent 70%)' }}
      />

      <div className={'relative max-w-6xl mx-auto px-6 pt-32 pb-24'}>
        {/* Brand mark */}
        <div className={'flex items-baseline select-none leading-none font-display font-black tracking-[-0.02em] text-[clamp(5rem,15vw,13rem)]'}>
          {/* Fixed first slash */}
          <span className={'inline-block text-accent animate-slash-in'}>/</span>

          {/* Moving slash + wordmark */}
          <span className={'relative inline-block'}>
            {/* Reserve exactly one slash width */}
            <span className={'invisible inline-block w-[0.45em]'}>/</span>

            {/* Wordmark */}
            <span className={'inline-block whitespace-nowrap text-foreground animate-name-reveal'}>
              RMCKR
            </span>

            {/* Moving slash */}
            <span className={'absolute inset-y-0 left-0 z-10 inline-block text-accent animate-slash-reveal'}>
              /
            </span>
          </span>
        </div>

        {/* Tagline */}
        <p
          className={'hero-tagline max-w-2xl mb-8 leading-relaxed text-muted'}
          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)' }}
        >
          <Trans
            i18nKey={'hero.tagline'}
            components={{ highlight: <span className={'text-foreground'}/> }}
          />
        </p>

        {/* Meta row */}
        <div className={'hero-meta flex flex-wrap gap-6 mb-12 items-center font-mono text-xs text-muted'}>
          <span className={'flex items-center gap-2'}>
            <LuMapPin size={12} className={'text-accent'}/>
            <span>{t('hero.location')}</span>
          </span>
          <span className={'flex items-center gap-2'}>
            <LuBriefcase size={12} className={'text-accent'}/>
            <span>{t('hero.status')}</span>
          </span>
          <span className={'flex items-center gap-2'}>
            <LuContact size={12} className={'text-accent'}/>
            <span>{t('hero.avail')}</span>
          </span>
        </div>

        {/* CTAs */}
        <div className={'hero-cta flex flex-wrap gap-4'}>
          <a href={'#about'} className={'btn-primary'}>
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
        className={[
          'absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500 font-mono text-xs text-muted',
          scrolled ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        ].join(' ')}
      >
        <span>{t('hero.scroll')}</span>
        <div
          className={'w-px h-12'}
          style={{ background: 'linear-gradient(to bottom, var(--color-muted), transparent)' }}
        />
      </div>
    </section>
  )
}
