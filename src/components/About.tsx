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

      <div className={'mt-12 flex flex-col items-start gap-12 lg:flex-row lg:gap-20'}>

        {/* Image */}
        <div className={'w-full lg:w-1/3'}>
          <div className={'relative border-b-4 border-accent bg-linear-to-t from-accent/50 to-transparent'}>
            <img
              src={'/images/portrait.png'}
              alt={'Portrait Lukas Romacker'}
              className={'size-full px-1'}
            />
          </div>
        </div>

        {/* Text */}
        <div className={'w-full lg:w-2/3'}>
          <div className={'space-y-5 copy'}>
            <p>
              <Trans i18nKey={'about.p1'} components={highlightComponents}/>
            </p>

            <p>
              <Trans i18nKey={'about.p2'} components={highlightComponents}/>
            </p>

            <p>{t('about.p3')}</p>
          </div>

          <div className={'mt-10'}>
            <a
              href={'/Lukas-Romacker-Resume.pdf'}
              target={'_blank'}
              rel={'noopener noreferrer'}
              className={'btn-primary btn-lg'}
            >
              {t('about.downloadCv')}
            </a>
          </div>
        </div>

      </div>
    </Section>
  )
}
