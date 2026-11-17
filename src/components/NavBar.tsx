import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { sections } from '@/data/sections'
import { CONTACT_EMAIL, NAME } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

const LANGS = ['en', 'de'] as const

function currentLang(language: string) {
  return language.startsWith('de') ? 'de' : 'en'
}

function LangToggle({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = currentLang(i18n.language)

  return (
    <div
      className={cn('flex h-10 items-center', className)}
      role="group"
      aria-label={t('ui.language')}
    >
      {LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={cn(
            'label px-1.5 py-2 transition-[color,background-color,border-color] duration-200 ease-out motion-reduce:transition-none',
            current === lng ? 'text-foreground' : 'text-muted hover-fine:text-foreground'
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
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      // The menu is the only surface on screen, so Tab cycles it: the page
      // behind cannot take focus while `aria-modal` says it is unavailable.
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t('ui.sections')}
      // Closed, it stays on screen for the exit: `inert` and no pointer events
      // keep the page behind it reachable while it fades.
      inert={!open}
      className={cn(
        'fixed inset-0 z-60 flex touch-none flex-col overscroll-contain bg-background transition-[opacity,translate] duration-220 ease-out motion-reduce:transition-none md:hidden',
        'starting:translate-y-2 starting:opacity-0',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <button ref={closeRef} type="button" onClick={onClose} className="label h-10 px-2 text-foreground">
          {t('ui.close')}
        </button>
      </div>

      <nav
        className="container-page flex flex-1 flex-col justify-center gap-2"
        aria-label={t('ui.sections')}
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={onClose}
            data-scroll-duration="1.1"
            className="flex items-baseline rounded-lg border border-line bg-surface px-5 py-4"
          >
            <span className="text-display text-foreground">{t(section.labelKey)}</span>
          </a>
        ))}
      </nav>

      <div className="container-page flex items-center justify-between gap-4 py-6">
        <a href={`mailto:${CONTACT_EMAIL}`} className="label min-w-0 truncate text-muted">
          {CONTACT_EMAIL}
        </a>
        <LangToggle />
      </div>
    </div>
  )
}

export function NavBar() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  const navRef = useRef<HTMLElement>(null)
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([])
  const markRef = useRef<HTMLSpanElement>(null)
  const markBarRef = useRef<HTMLSpanElement>(null)

  // The current section is the one holding the middle of the viewport, read
  // from the page rather than remembered: at the hero no section reaches the
  // line, so no link is current and the bar shows no rule.
  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    let frame = 0

    const measure = () => {
      frame = 0
      const line = window.innerHeight / 2
      const current = elements.find((element) => {
        const rect = element.getBoundingClientRect()
        return rect.top <= line && rect.bottom > line
      })

      setActive(current?.id ?? '')
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // The first read is scheduled like every scroll, so the bar paints once.
    onScroll()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // The rule is one element that travels between entries. The label is what is
  // measured, not the link, so the rule is exactly as wide as the word.
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    let cancelled = false

    // The rule is written straight onto its two elements: the measurement is
    // layout, not state, so nothing has to render again before it is in place.
    const measure = () => {
      if (cancelled) return

      const mark = markRef.current
      const bar = markBarRef.current
      if (!mark || !bar) return

      const index = sections.findIndex((section) => section.id === active)
      const label = labelsRef.current[index]

      if (!label || nav.offsetWidth === 0) {
        mark.style.opacity = '0'
        bar.style.transform = 'scaleX(0)'
        return
      }

      const navRect = nav.getBoundingClientRect()
      const labelRect = label.getBoundingClientRect()
      // The rule's box is `w-32`, so its base is 8rem in the root's own pixels
      // rather than a fixed 128: a larger default font grows the box too.
      const base = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 8
      mark.style.transform = `translateX(${labelRect.left - navRect.left}px)`
      bar.style.transform = `scaleX(${base > 0 ? labelRect.width / base : 0})`
      mark.style.opacity = '1'
    }

    measure()
    void document.fonts.ready.then(measure)

    // A language switch, a resize or a late webfont changes the label widths
    // under the rule, so both the labels and the nav are watched.
    const observer = new ResizeObserver(measure)
    observer.observe(nav)
    for (const label of labelsRef.current) {
      if (label) observer.observe(label)
    }

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [active, i18n.language])

  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  return (
    <>
      {/* The bar is a band across the full width: the page's own ground, lifted
          one `surface` step so the band is a shade above the page, with one
          hairline and one short shadow under it. The lift is a layer over the
          header's own fill, so the band stays opaque and the page scrolls under
          it rather than through it. */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background shadow-[0_2px_6px_rgb(0_0_0/0.5)]">
        <div className="bg-surface">
          <div className="container-page flex h-16 items-center gap-2">
            <a
              href="#top"
              aria-label={`RMCKR, ${NAME}`}
              data-scroll-duration="1.4"
              className="mr-auto shrink-0"
            >
              <Logo />
            </a>

            <nav
              ref={navRef}
              className="relative hidden h-full items-stretch gap-1 md:flex"
              aria-label={t('ui.sections')}
            >
              <span
                ref={markRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-32 origin-left opacity-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
              >
                {/* The width rides its own transition on the same curve, so
                    the rule stretches on its way and settles under the word. */}
                <span
                  ref={markBarRef}
                  className="block size-full origin-left bg-accent transition-transform duration-200 ease-out motion-reduce:transition-none"
                />
              </span>

              {sections.map((section, index) => {
                const isActive = active === section.id

                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    data-scroll-duration="1.2"
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'label flex items-center px-2 transition-[color] duration-200 ease-out motion-reduce:transition-none lg:px-3',
                      isActive ? 'text-foreground' : 'text-muted hover-fine:text-foreground'
                    )}
                  >
                    <span
                      ref={(element) => {
                        labelsRef.current[index] = element
                      }}
                    >
                      {t(section.labelKey)}
                    </span>
                  </a>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 md:ml-4">
              <LangToggle className="hidden sm:flex" />
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="press label h-10 px-2 text-foreground md:hidden"
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
