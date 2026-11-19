import { LuArrowUp, LuHeart } from 'react-icons/lu'
import { SiReact } from 'react-icons/si'
import { sections } from '@/data/sections'
import { useTranslation } from '@/i18n/i18n'

/** The build's year: read once, so the footer is a pure render and the client
 *  agrees with the prerendered markup. */
const YEAR = new Date().getFullYear()

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page py-12 md:py-14">
        <ul className="grid gap-0.5 sm:grid-cols-2 sm:gap-x-(--seam)">
          <li>
            <a
              href="#top"
              aria-label={`RMCKR, ${t('ui.backToTop')}`}
              data-scroll-duration="1.6"
              className="press wordmark flex items-center py-2 text-lead leading-none text-foreground"
            >
              <span aria-hidden="true" className="text-accent">
                {'//'}
              </span>
              <span aria-hidden="true">RMCKR</span>
            </a>
          </li>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                data-scroll-duration="1.3"
                className="press block py-2 text-body text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
              >
                {t(section.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Full width, so the rule between the index and the closing bar is the
          same line the footer's own top edge is drawn with. */}
      <div className="border-t border-line">
        <div className="label container-page grid grid-cols-1 gap-2 py-5 text-muted sm:grid-cols-3 sm:items-center sm:gap-6">
          <span className="flex flex-wrap items-center gap-x-2">
            <span>{t('footer.copyright', { year: YEAR })}</span>
            <span aria-hidden="true">·</span>
            <a
              href="/legal"
              className="press transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
            >
              {t('footer.legal')}
            </a>
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-self-center">
            {t('footer.builtWith')}
            <LuHeart aria-hidden="true" className="size-3.5 fill-accent text-accent" />
            <span className="sr-only">{t('footer.love')}</span>
            {t('footer.and')}
            <SiReact aria-hidden="true" className="size-3.5" />
            <span className="sr-only">React</span>
          </span>
          <a
            href="#top"
            data-scroll-duration="1.6"
            className="press inline-flex items-center gap-2 py-1 self-start text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none sm:justify-self-end sm:self-auto"
          >
            {t('ui.backToTop')}
            <LuArrowUp aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
