import { useCallback, useEffect, useRef, useState } from 'react'
import { sections } from '@/data/sections'
import { CONTACT_EMAIL, NAME } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

function LangToggle({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('de') ? 'de' : 'en'

  return (
    <div
      className={cn('flex items-center gap-0.5 rounded-lg border border-line bg-white/[0.03] p-0.5', className)}
      role="group"
      aria-label={t('ui.language')}
    >
      {(['en', 'de'] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={cn(
            'label-mono rounded-md px-2.5 py-1.5',
            current === lng ? 'bg-white/10 text-ink' : 'text-muted hover-fine:text-ink'
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t('ui.sections')}
      className="fixed inset-0 z-[60] flex touch-none flex-col overscroll-contain bg-ground md:hidden"
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />
        <button ref={closeRef} type="button" onClick={onClose} className="btn h-10 px-4 text-[0.85rem]">
          {t('ui.close')}
        </button>
      </div>

      <nav className="container-page flex flex-1 flex-col justify-center gap-2" aria-label={t('ui.sections')}>
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={onClose}
            className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4"
          >
            <span className="text-[1.5rem] leading-tight font-light tracking-[-0.03em] text-ink">
              {t(section.labelKey)}
            </span>
            <span className="label-mono text-faint">{String(index + 1).padStart(2, '0')}</span>
          </a>
        ))}
      </nav>

      <div className="container-page flex items-center justify-between gap-4 py-6">
        <a href={`mailto:${CONTACT_EMAIL}`} className="label-mono min-w-0 truncate text-muted">
          {CONTACT_EMAIL}
        </a>
        <LangToggle />
      </div>
    </div>
  )
}

export function NavBar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] }
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-linear-to-b from-ground via-ground/85 to-transparent pb-4">
        <div className="container-page">
          <div className="mt-3 flex h-14 items-center justify-between gap-3 rounded-xl border border-line bg-[#0b0b0c]/85 pr-1.5 pl-3 backdrop-blur-xl md:mt-4 md:pr-2 md:pl-4">
            <a href="#top" aria-label={NAME} className="shrink-0">
              <Logo />
            </a>

            <nav className="hidden items-center gap-1 md:flex" aria-label={t('ui.sections')}>
              {sections.map((section) => {
                const isActive = active === section.id
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'label-mono rounded-lg px-3.5 py-2',
                      isActive
                        ? 'bg-white/[0.07] text-ink'
                        : 'text-muted hover-fine:bg-white/[0.04] hover-fine:text-ink'
                    )}
                  >
                    {t(section.labelKey)}
                  </a>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <LangToggle className="hidden sm:flex" />
              <a href="#contact" className="btn btn-solid hidden h-10 px-4 text-[0.85rem] lg:inline-flex">
                {t('navCta')}
              </a>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="label-mono grid h-10 place-items-center rounded-lg border border-line-strong px-3.5 text-ink md:hidden"
              >
                {t('ui.menu')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={closeMenu} />
    </>
  )
}
