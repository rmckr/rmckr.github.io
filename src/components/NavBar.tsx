import { sections } from '@/data/sections'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { LuLanguages } from 'react-icons/lu'
import { useTranslation } from '../i18n/i18n'
import { Logo } from './Logo'

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
          'border-b border-subtle bg-bg/92 backdrop-blur-md' :
          'border-transparent bg-transparent'
      )}
    >
      <div className={'container-page py-4 grid grid-cols-[1fr_auto_1fr] items-center'}>
        {/* Logo */}
        <a href={'#hero'} aria-label={'RMCKR'}>
          <Logo className={'text-sm'}/>
        </a>

        {/* Nav links */}
        <div className={'hidden md:flex items-center justify-center gap-8'}>
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={'text-sm link-muted'}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className={'col-start-3 flex items-center justify-end gap-3'}>
          <button
            onClick={languageToggle}
            className={'btn-secondary'}
            aria-label={'Toggle language'}
          >
            <LuLanguages size={14}/>
            <span>{i18n.resolvedLanguage === 'en' ? 'DE' : 'EN'}</span>
          </button>

          <a href={'#contact'} className={'hidden md:inline-flex btn-primary uppercase tracking-wider'}>
            {t('navCta')}
          </a>
        </div>
      </div>
    </nav>
  )
}
