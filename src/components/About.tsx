import { Trans } from 'react-i18next'
import { LuArrowDown } from 'react-icons/lu'
import { CONTACT_EMAIL } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { highlightComponents } from '@/lib/trans'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function About() {
  const { t } = useTranslation()

  return (
    <Section id="about" label={t('about.label')}>
      <div className="container-page py-16 md:py-24">
        <SectionHeader index="01" label={t('about.label')} heading={t('about.heading')} />

        <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10 md:mt-14">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[1.2rem] leading-[1.6] tracking-[-0.01em] text-muted md:text-[1.3rem]">
              <Trans i18nKey="about.p1" components={highlightComponents} />
            </p>
            <p className="mt-6 max-w-[58ch] text-[1rem] leading-[1.7] text-muted">
              <Trans i18nKey="about.p2" components={highlightComponents} />
            </p>
          </div>

          <aside className="col-span-12 md:col-span-4 md:col-start-9">
            <div className="card p-6">
              <p className="label-mono flex items-center gap-2.5 text-ink">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {t('hero.avail')}
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-5 block font-mono text-[0.9rem] break-all text-ink underline decoration-line underline-offset-[5px] hover-fine:decoration-ink/40"
              >
                {CONTACT_EMAIL}
              </a>

              <a href="/Lukas-Romacker-Resume.pdf" download className="btn mt-6 w-full">
                {t('about.downloadCv')}
                <LuArrowDown aria-hidden="true" className="size-4" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  )
}
