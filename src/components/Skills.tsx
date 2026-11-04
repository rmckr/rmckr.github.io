import type { Skill, SkillTag } from '@/data/index'
import { skills } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

const TAG_ORDER: SkillTag[] = ['lang', 'frontend', 'backend', 'tool', 'db', 'infra']

const TIER_LABEL = { 1: 'basic', 2: 'proficient', 3: 'advanced' } as const

/** Three slots; the filled ones are the self-assessed level. */
function Meter({ tier }: { tier: Skill['tier'] }) {
  return (
    <span aria-hidden="true" className="flex items-center gap-1">
      {[1, 2, 3].map((slot) => (
        <span
          key={slot}
          className={slot <= tier ? 'block h-1 w-3.5 rounded-xs bg-ink' : 'block h-1 w-3.5 rounded-xs bg-white/10'}
        />
      ))}
    </span>
  )
}

export function Skills() {
  const { t } = useTranslation()

  const groups = TAG_ORDER.map((tag) => ({
    tag,
    items: skills.filter((skill) => skill.tag === tag)
  })).filter((group) => group.items.length > 0)

  return (
    <Section id="skills" label={t('skills.label')}>
      <div className="container-page py-16 md:py-24">
        <SectionHeader
          index="03"
          label={t('skills.label')}
          heading={t('skills.heading')}
          aside={
            <ul className="flex flex-wrap gap-2">
              {([3, 2, 1] as const).map((tier) => (
                <li key={tier} className="chip label-mono text-muted">
                  <Meter tier={tier} />
                  {t(`skills.tiers.${TIER_LABEL[tier]}`)}
                </li>
              ))}
            </ul>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.tag} className="card p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="label-mono text-ink">{t(`skills.tags.${group.tag}`)}</h3>
                <span className="label-mono text-faint">{String(group.items.length).padStart(2, '0')}</span>
              </div>

              <ul className="mt-4">
                {group.items.map((skill) => {
                  const Icon = skill.icon

                  return (
                    <li key={skill.name} className="flex items-center gap-3 border-t border-line/70 py-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white/[0.04]">
                        <Icon aria-hidden="true" className="size-3.5 text-muted" />
                      </span>
                      <span className="text-[0.95rem] text-ink">{skill.name}</span>
                      <span className="ml-auto flex items-center gap-3">
                        <span className="sr-only">{t(`skills.tiers.${TIER_LABEL[skill.tier]}`)}</span>
                        <Meter tier={skill.tier} />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
