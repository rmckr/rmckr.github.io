import { useMemo, useState } from 'react'
import { useTranslation } from '../i18n/i18n'
import { useReveal } from '../hooks/useReveal'
import { SectionHeader } from './SectionHeader'
import { skills, tagColors } from '../data'

export function Skills() {
  const { t } = useTranslation()
  const ref = useReveal()
  const [filter, setFilter] = useState<string | null>(null)

  const tags = useMemo(
    () => [...new Set(skills.map((skill) => skill.tag))],
    []
  )

  return (
    <section id={'skills'} className={'py-32'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>
          <SectionHeader
            label={t('skills.label')}
            heading={t('skills.heading')}
          />

          <div className={'grid grid-cols-1 md:grid-cols-3'}>
            {[3, 2, 1].map((tier, index) => {
              const items = skills.filter((skill) => skill.tier === tier)

              const label =
                tier === 3 ?
                  t('skills.tiers.advanced') :
                  tier === 2 ?
                    t('skills.tiers.proficient') :
                    t('skills.tiers.basic')

              return (
                <div
                  key={tier}
                  className={`
                    py-2
                    md:px-6
                    first:md:pl-0
                    last:md:pr-0
                    ${index > 0 ? 'md:border-l border-subtle' : ''}
                    ${index > 0 ? 'mt-10 md:mt-0' : ''}
                  `}
                >
                  <div className={'flex items-end justify-between gap-4 mb-8'}>
                    <div>
                      <h3 className={'font-display font-extrabold text-xl text-foreground mt-1'}>
                        {label}
                      </h3>
                    </div>

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
                          className={`group transition-opacity duration-200 ${
                            visible ? 'opacity-100' : 'opacity-20'
                          }`}
                        >
                          <div className={'flex items-center justify-between gap-4 py-3'}>
                            <div className={'flex items-center gap-2.5 min-w-0'}>
                              <skill.icon size={20}/>
                              <span className={'text-sm text-foreground'}>
                                {skill.name}
                              </span>
                            </div>

                            <span
                              className={'shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider'}
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

          <div
            role={'group'}
            className={'mt-10 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase'}
          >
            <button
              type={'button'}
              onClick={() => setFilter(null)}
              className={`cursor-pointer transition-colors duration-200 focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-4 ${
                filter === null ?
                  'text-foreground' :
                  'text-muted hover:text-foreground'
              }`}
            >
              {t('skills.all')}
            </button>

            {tags.map((tag) => (
              <button
                key={tag}
                type={'button'}
                onClick={() => setFilter(filter === tag ? null : tag)}
                className={`flex items-center gap-2 cursor-pointer uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-4 ${
                  filter === tag ?
                    'text-foreground' :
                    'text-muted hover:text-foreground'
                }`}
              >
                <span
                  className={'w-1.5 h-1.5'}
                  style={{ background: tagColors[tag] }}
                />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
