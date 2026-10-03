import { Trans } from 'react-i18next'
import { LuExternalLink, LuMail } from 'react-icons/lu'
import { CONTACT_EMAIL, socialLinks } from '../data'
import { useReveal } from '../hooks/useReveal'
import { useTranslation } from '../i18n/i18n'
import { SectionHeader } from './SectionHeader'

export function Contact() {
  const { t } = useTranslation()
  const ref = useReveal()

  return (
    <section id={'contact'} className={'py-32 grid-bg'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>
          <SectionHeader label={t('contact.label')} heading={t('contact.heading')}/>

          <div className={'max-w-2xl'}>
            <p className={'text-muted text-lg leading-relaxed mb-10'}>
              <Trans
                i18nKey={'contact.desc'}
                components={{ highlight: <span className={'text-foreground'}/> }}
              />
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={'group inline-flex items-center gap-3 text-lg font-semibold text-accent no-underline mb-12'}
            >
              <LuMail size={18}/>
              <span>{CONTACT_EMAIL}</span>
              <LuExternalLink
                size={12}
                className={'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}
              />
            </a>

            <div className={'flex flex-wrap gap-6'}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={'_blank'}
                  rel={'noreferrer'}
                  className={'inline-flex items-center gap-1.5 font-mono text-sm text-muted hover:text-foreground transition-colors duration-200 no-underline'}
                >
                  <link.icon/>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
