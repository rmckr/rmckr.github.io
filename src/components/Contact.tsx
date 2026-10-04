import { Trans } from 'react-i18next'
import { LuExternalLink, LuMail } from 'react-icons/lu'
import { highlightComponents } from '@/lib/trans'
import { CONTACT_EMAIL, socialLinks } from '../data'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function Contact() {
  const { t } = useTranslation()

  return (
    <Section id={'contact'} className={'grid-bg'}>
      <SectionHeader label={t('contact.label')} heading={t('contact.heading')}/>

      <div className={'max-w-2xl'}>
        <p className={'copy mb-10'}>
          <Trans i18nKey={'contact.desc'} components={highlightComponents}/>
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={'group inline-flex items-center gap-3 text-lg font-semibold text-accent hover:text-foreground transition-colors duration-200 mb-12'}
        >
          <LuMail size={18}/>
          <span>{CONTACT_EMAIL}</span>
          <LuExternalLink size={12} className={'icon-nudge'}/>
        </a>

        <div className={'flex flex-wrap gap-6'}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={'_blank'}
              rel={'noreferrer'}
              className={'link-muted inline-flex items-center gap-1.5 font-mono text-sm'}
            >
              <link.icon/>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </Section>
  )
}
