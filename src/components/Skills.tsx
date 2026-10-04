import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'
import { skills, tagColors } from '../data'

export function Skills() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<string | null>(null)

  const tags = useMemo(
    () => [...new Set(skills.map((skill) => skill.tag))],
    []
  )

  return (
    <Section id={'skills'}>
      <SectionHeader
        label={t('skills.label')}
        heading={t('skills.heading')}
      />

      <div className={'grid grid-cols-1 gap-y-10 md:grid-cols-3 md:divide-x md:divide-subtle'}>
        {[3, 2, 1].map((tier) => {
          const items = skills.filter((skill) => skill.tier === tier)

          const label =
            tier === 3 ?
              t('skills.tiers.advanced') :
              tier === 2 ?
                t('skills.tiers.proficient') :
                t('skills.tiers.basic')

          return (
            <div key={tier} className={'py-2 md:px-6 md:first:pl-0 md:last:pr-0'}>
              <div className={'flex items-end justify-between gap-4 mb-8'}>
                <h3 className={'text-xl'}>{label}</h3>

                <span className={'font-display font-extrabold text-xl text-accent'}>
                  {String(items.length)}
                </span>
              </div>

              <ul>
                {items.map((skill) => {
                  const visible =
                    filter === null || filter === skill.tag

                  return (
                    <li
                      key={skill.name}
                      className={cn('transition-opacity duration-200', visible ? 'opacity-100' : 'opacity-20')}
                    >
                      <div className={'flex items-center justify-between gap-4 py-3'}>
                        <div className={'flex items-center gap-2.5 min-w-0'}>
                          <skill.icon size={20}/>
                          <span className={'text-sm text-foreground'}>
                            {skill.name}
                          </span>
                        </div>

                        <span
                          className={'label shrink-0 border px-1.5 py-0.5 text-2xs'}
                          style={{
                            borderColor: tagColors[skill.tag],
                            color: tagColors[skill.tag]
                          }}
                        >
                          {skill.tag}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <div role={'group'} className={'label mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs'}>
        <button
          type={'button'}
          onClick={() => setFilter(null)}
          aria-pressed={filter === null}
          className={'link-muted aria-pressed:text-foreground'}
        >
          {t('skills.all')}
        </button>

        {tags.map((tag) => (
          <button
            key={tag}
            type={'button'}
            onClick={() => setFilter(filter === tag ? null : tag)}
            aria-pressed={filter === tag}
            className={'link-muted aria-pressed:text-foreground flex items-center gap-2'}
          >
            <span className={'size-1.5'} style={{ background: tagColors[tag] }}/>
            {tag}
          </button>
        ))}
      </div>
    </Section>
  )
}
