import { Mail, ArrowUpRight, Globe } from 'lucide-react'
import { Trans } from 'react-i18next'
import { useTranslation } from '../i18n/i18n'
import { useReveal } from '../hooks/useReveal'
import { SectionHeader } from './SectionHeader'
import { GITHUB_USERNAME, CONTACT_EMAIL } from '../data'
import { SiGithub } from '@icons-pack/react-simple-icons'

export function Contact() {
  const { t } = useTranslation()
  const ref = useReveal()

  const socialLinks = [
    { label: t('socialLinks.0'), href: `https://github.com/${GITHUB_USERNAME}`, icon: <SiGithub size={14}/> },
    { label: t('socialLinks.1'), href: '#', icon: <Globe size={14}/> },
    { label: t('socialLinks.2'), href: '#', icon: null },
    { label: t('socialLinks.3'), href: '#', icon: null }
  ]

  return (
    <section id={'contact'} className={'py-32 grid-bg'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>
          <SectionHeader label={t('contactLabel')} heading={t('contactHeading')}/>

          <div className={'max-w-2xl'}>
            <p className={'text-muted text-lg leading-relaxed mb-10'}>
              <Trans
                i18nKey={'contactDesc'}
                components={{ highlight: <span className={'text-foreground'}/> }}
              />
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={'group inline-flex items-center gap-3 text-lg font-semibold text-accent no-underline mb-12'}
            >
              <Mail size={18}/>
              <span>{CONTACT_EMAIL}</span>
              <ArrowUpRight
                size={16}
                className={'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}
              />
            </a>

            <div className={'flex flex-wrap gap-6'}>
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={'_blank'}
                  rel={'noreferrer'}
                  className={'inline-flex items-center gap-1.5 font-mono text-sm text-muted hover:text-foreground transition-colors duration-200 no-underline'}
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
