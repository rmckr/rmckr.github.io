import { useTranslation } from '@/i18n/i18n'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-3 py-8 md:flex-row md:items-center md:justify-between md:gap-6">
        <span className="label-mono text-muted">{t('footer.copyright')}</span>
        <span className="label-mono text-faint">
          {t('footer.builtWith')} React {t('footer.and')} Tailwind CSS
        </span>
        <a
          href="#top"
          className="label-mono inline-flex items-center gap-2 self-start text-muted hover-fine:text-ink md:self-auto"
        >
          {t('ui.backToTop')}
          <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}
