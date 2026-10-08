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
    // See-through by design (#contact is transparent in index.css) so the
    // ambient grid runs right through this section
    <Section id={'contact'}>
      <SectionHeader label={t('contact.label')} heading={t('contact.heading')}/>

      <div className={'max-w-2xl stagger'}>
        <p className={'mb-10 copy'}>
          <Trans i18nKey={'contact.desc'} components={highlightComponents}/>
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={'group mb-12 inline-flex items-center gap-3 text-lg font-semibold text-accent transition-colors duration-200 hover:text-foreground'}
        >
          <LuMail size={18}/>
          <span className={'relative'}>
            {CONTACT_EMAIL}
            <span
              aria-hidden={'true'}
              className={'absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100'}
            />
          </span>
          <LuExternalLink size={12} className={'icon-nudge'}/>
        </a>

        <div className={'flex flex-wrap gap-6'}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={'_blank'}
              rel={'noreferrer'}
              className={'inline-flex items-center gap-1.5 font-mono text-sm link-muted transition-transform duration-200 hover:-translate-y-0.5'}
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
