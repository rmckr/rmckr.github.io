import { Trans } from 'react-i18next'
import { highlightComponents } from '@/lib/trans'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

// ── About section ─────────────────────────────────────────────────────────────
// Composition mirrors the hero rather than a document: the portrait pins on
// desktop while the copy scrolls past (the stage's sticky behaviour, without
// the animation), the copy wears the tagline's accent rule, and the CV action
// parks bottom-right the way the hero parks its buttons. The section paints
// its own solid ground (it can't borrow the ambient backdrop any more), so the
// cutout portrait brings its own light: a halo gradient lightbox, framed by
// the buttons' bevel — cut short at the top so the head crosses the border.

export function About() {
  const { t } = useTranslation()

  return (
    <Section id={'about'}>
      <SectionHeader label={t('about.label')} heading={t('about.heading')} />

      <div
        className={
          'mt-12 flex flex-col items-start gap-12 stagger lg:flex-row lg:items-center lg:gap-20'
        }
      >
        {/* Image */}
        <div className={'w-full sm:w-1/2 md:w-2/5 lg:w-1/3'}>
          <div className={'relative mt-[-10%] bevel-10'}>
            <span
              className={
                'pointer-events-none absolute inset-0 top-[10%] -z-1 border-2 border-accent bg-radial-[75%_75%_at_50%_90%] from-white/40 to-transparent bevel-10'
              }
              aria-hidden={'true'}
            />
            <img
              src={'/images/portrait.png'}
              alt={'Portrait Lukas Romacker'}
              width={2775}
              height={2580}
              loading={'lazy'}
              decoding={'async'}
              className={'w-full px-0.5 pb-0.5'}
            />
          </div>
        </div>

        <div className={'w-full lg:flex-1'}>
          <div className={'space-y-5 copy'}>
            <p>
              <Trans i18nKey={'about.p1'} components={highlightComponents} />
            </p>

            <p>
              <Trans i18nKey={'about.p2'} components={highlightComponents} />
            </p>
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
