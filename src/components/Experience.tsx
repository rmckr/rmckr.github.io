import { useTranslation } from '@/i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

type ExperienceEntry = {
  title: string
  organisation: string
  period: string
  desc: string
}

export function Experience() {
  const { t } = useTranslation()
  const entries = t('experience.entries', { returnObjects: true }) as unknown as ExperienceEntry[]

  return (
    <Section id="experience" label={t('experience.label')}>
      <div className="container-page py-16 md:py-24">
        <SectionHeader index="02" label={t('experience.label')} heading={t('experience.heading')} />

        <p className="mt-8 max-w-[62ch] text-[1rem] leading-[1.7] text-muted md:mt-10">{t('experience.desc')}</p>

        <ol className="mt-10 grid gap-3 md:mt-14">
          {entries.map((entry, index) => (
            <li key={entry.title} className="card p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-3">
                  <span className="label-mono text-faint">{String(index + 1).padStart(2, '0')}</span>
                  <p className="mt-3 font-mono text-[0.85rem] text-muted">{entry.period}</p>
                </div>

                <div className="md:col-span-9">
                  <h3 className="text-[1.15rem] leading-snug font-medium tracking-[-0.015em] text-ink md:text-[1.35rem]">
                    {entry.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9rem] text-muted">{entry.organisation}</p>
                  <p className="mt-4 max-w-[64ch] text-[0.975rem] leading-[1.7] text-muted">{entry.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
