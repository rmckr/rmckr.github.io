import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from '../i18n/i18n'
import { useReveal } from '../hooks/useReveal'
import { SectionHeader } from './SectionHeader'

type ProjectEntry = { num: string, name: string, type: string, year: string, desc: string, tags: string[] }

export function Projects() {
  const { t } = useTranslation()
  const ref = useReveal()

  const projects = t('projects', { returnObjects: true }) as ProjectEntry[]

  return (
    <section id={'projects'} className={'py-32'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>
          <SectionHeader label={t('projectsLabel')} heading={t('projectsHeading')}/>

          <div>
            {projects.map((p, i) => (
              <a
                key={p.name}
                href={'#'}
                className={[
                  'group flex flex-col md:flex-row md:items-start gap-6 py-8',
                  'border-t border-subtle hover:bg-accent/2 transition-colors duration-200 no-underline',
                  i === projects.length - 1 ? 'border-b border-subtle' : ''
                ].join(' ')}
              >
                {/* Number */}
                <div className={'md:w-16 shrink-0 font-mono text-xs text-muted pt-1.5'}>
                  {p.num}
                </div>

                {/* Details */}
                <div className={'flex-1'}>
                  <div className={'flex flex-wrap items-baseline gap-4 mb-3'}>
                    <h3 className={'font-display font-bold text-3xl text-foreground tracking-[-0.01em] group-hover:text-accent transition-colors duration-200'}>
                      {p.name}
                    </h3>
                    <span className={'font-mono text-xs text-muted'}>{p.type} · {p.year}</span>
                  </div>

                  <p className={'text-muted leading-[1.65] max-w-[55ch]'}>{p.desc}</p>

                  <div className={'flex flex-wrap gap-2 mt-4'}>
                    {p.tags.map((tag) => <span key={tag} className={'pill'}>{tag}</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className={'shrink-0 self-start text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200'}>
                  <ArrowUpRight size={20}/>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
