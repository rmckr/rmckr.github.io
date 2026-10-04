import { Trans } from 'react-i18next'
import { highlightComponents } from '@/lib/trans'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── About section ─────────────────────────────────────────────────────────────

export function About() {
  const { t } = useTranslation()

  return (
    <Section id={'about'}>
      <SectionHeader
        label={t('about.label')}
        heading={t('about.heading')}
      />

      <div className={'mt-12 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start'}>

        {/* Image */}
        <div className={'w-full lg:w-1/3'}>
          <div className={'relative aspect-4/5 overflow-hidden rounded-lg border border-subtle'}>
            <div className={'absolute inset-0 flex items-center justify-center'}>
              <span className={'label text-xs text-muted'}>
                Image placeholder
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className={'w-full lg:w-2/3'}>
          <div className={'copy space-y-5'}>
            <p>
              <Trans i18nKey={'about.p1'} components={highlightComponents}/>
            </p>

            <p>
              <Trans i18nKey={'about.p2'} components={highlightComponents}/>
            </p>

            <p>{t('about.p3')}</p>
          </div>

          <div className={'mt-10'}>
            <a href={'#'} className={'btn-primary btn-lg'}>
              {t('about.downloadCv')}
            </a>
          </div>
        </div>

      </div>
    </Section>
  )
}
