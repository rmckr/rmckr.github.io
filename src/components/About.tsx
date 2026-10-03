import { Trans } from 'react-i18next'
import { useTranslation } from '../i18n/i18n'
import { useReveal } from '../hooks/useReveal'
import { SectionHeader } from './SectionHeader'

// ── About section ─────────────────────────────────────────────────────────────

export function About() {
  const { t } = useTranslation()
  const ref = useReveal()

  return (
    <section id={'about'} className={'py-32'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>

          {/* Section header */}
          <SectionHeader
            label={t('about.label')}
            heading={t('about.heading')}
          />

          {/* Content */}
          <div className={'mt-12 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center'}>

            {/* Image */}
            <div className={'w-full lg:w-1/3'}>
              <div
                className={'relative aspect-4/5 overflow-hidden rounded-lg border border-subtle'}
              >
                <div className={'absolute inset-0 flex items-center justify-center'}>
                  <span className={'font-mono text-xs uppercase tracking-wider text-muted'}>
                    Image placeholder
                  </span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className={'w-full lg:w-2/3'}>
              <div className={'text-lg space-y-5 text-muted leading-relaxed'}>
                <p>
                  <Trans
                    i18nKey={'about.p1'}
                    components={{ highlight: <span className={'text-foreground'}/> }}
                  />
                </p>

                <p>
                  <Trans
                    i18nKey={'about.p2'}
                    components={{ highlight: <span className={'text-foreground'}/> }}
                  />
                </p>

                <p>{t('about.p3')}</p>
              </div>

              <div className={'mt-10'}>
                <a href={'#'} className={'btn-primary'}>
                  {t('about.downloadCv')}
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
