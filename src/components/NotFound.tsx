import { useEffect } from 'react'
import { NAME } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { Logo } from './Logo'

/** The app's view on an unknown path: the mark, the reason, and the way home. */
export function NotFound() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${t('notFound.heading')} · ${NAME}`
  }, [t])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center">
          <a
            href="/"
            aria-label={`RMCKR, ${NAME}`}
            className="transition-opacity duration-200 ease-out hover-fine:opacity-80 motion-reduce:transition-none"
          >
            <Logo />
          </a>
        </div>
      </header>

      <main id="main" className="container-page flex flex-1 flex-col justify-center py-16">
        <p className="label text-muted">404</p>
        <h1 className="mt-4 max-w-[20ch] text-display text-balance">{t('notFound.heading')}</h1>
        <p className="section-lead mt-6">{t('notFound.lead')}</p>
        <a href="/" className="btn btn-solid mt-8 self-start">
          {t('notFound.cta')}
        </a>
      </main>
    </div>
  )
}
