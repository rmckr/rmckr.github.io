import { sections } from '@/data/sections'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { LuLanguages } from 'react-icons/lu'
import { useTranslation } from '../i18n/i18n'

export function NavBar() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  function languageToggle() {
    void i18n.changeLanguage(
      i18n.resolvedLanguage === 'en' ? 'de' : 'en'
    )
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ?
          'border-b border-subtle bg-black/92 backdrop-blur-md' :
          'border-transparent bg-transparent'
      )}
    >
      <div className={'max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'}>
        {/* Logo */}
        <a href={'#hero'} className={'font-mono text-sm font-medium tracking-widest text-foreground'}>
          {/* eslint-disable-next-line @eslint-react/jsx-no-comment-textnodes */}
          <span className={'text-accent'}>//</span>
          RMCKR
        </a>

        {/* Nav links */}
        <div className={'hidden md:flex items-center gap-8'}>
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={'text-sm text-muted hover:text-foreground transition-colors duration-200'}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className={'flex items-center gap-3'}>
          <button
            onClick={languageToggle}
            className={'btn-secondary'}
            aria-label={'Toggle language'}
          >
            <LuLanguages size={12}/>
            <span>{i18n.resolvedLanguage === 'en' ? 'DE' : 'EN'}</span>
          </button>

          <a href={'#contact'} className={'hidden md:inline-flex px-4! py-2! btn-primary uppercase tracking-wider'}>
            {t('navCta')}
          </a>
        </div>
      </div>
    </nav>
  )
}
