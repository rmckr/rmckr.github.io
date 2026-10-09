import { sections } from '@/data/sections'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { LuLanguages } from 'react-icons/lu'
import { useRafScroll } from '../hooks/useRafScroll'
import { useTranslation } from '../i18n/i18n'
import { Logo } from './Logo'

const SECTION_IDS = ['hero', ...sections.map((item) => item.id)] as const

export function NavBar() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('hero')
  const progressRef = useRef<HTMLDivElement>(null)

  function languageToggle() {
    void i18n.changeLanguage(i18n.resolvedLanguage === 'en' ? 'de' : 'en')
  }

  useRafScroll((scrollY) => {
    setScrolled(scrollY > 40)

    // Reading progress across the very top edge of the bar
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const progress = max > 0 ? Math.min(scrollY / max, 1) : 0
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
    }

    // Section currently under the nav
    let current: string = SECTION_IDS[0]
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= 140) current = id
    }
    setActive((previous) => (previous === current ? previous : current))
  }, true)

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-subtle bg-bg/92 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      )}
    >
      <div className={'container-page grid grid-cols-[1fr_auto_1fr] items-center py-4'}>
        {/* Logo */}
        <a href={'#hero'} aria-label={'RMCKR'}>
          <Logo className={'text-sm'} />
        </a>

        {/* Nav links */}
        <div className={'hidden items-center justify-center gap-8 md:flex'}>
          {sections.map((item) => {
            const isActive = active === item.id

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative py-1 text-sm link-muted',
                  isActive && 'text-foreground'
                )}
              >
                {t(item.labelKey)}

                {/* Sliding underline: active section, or the hovered link */}
                <span
                  aria-hidden={'true'}
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300 ease-out',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )}
                />
              </a>
            )
          })}
        </div>

        {/* Actions */}
        <div className={'col-start-3 flex items-center justify-end gap-3'}>
          <button
            onClick={languageToggle}
            className={'btn-secondary'}
            aria-label={'Toggle language'}
          >
            <LuLanguages size={14} />
            <span>{i18n.resolvedLanguage === 'en' ? 'DE' : 'EN'}</span>
          </button>

          <a
            href={'#contact'}
            className={'btn-primary hidden tracking-wider uppercase md:inline-flex'}
          >
            {t('navCta')}
          </a>
        </div>
      </div>

      {/* Reading progress */}
      <div
        ref={progressRef}
        aria-hidden={'true'}
        style={{ transform: 'scaleX(0)' }}
        className={'absolute inset-x-0 bottom-0 h-px origin-left bg-accent'}
      />
    </nav>
  )
}
