import { useTranslation } from '../i18n/i18n'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="py-8 border-t border-subtle">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-muted">{t('footer')}</span>
        <span className="font-mono text-xs text-accent">//RMCKR</span>
      </div>
    </footer>
  )
}
