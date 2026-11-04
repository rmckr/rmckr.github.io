import { useEffect, useRef, useState } from 'react'
import { LuArrowUpRight, LuCheck, LuCopy } from 'react-icons/lu'
import { CONTACT_EMAIL, socialLinks } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { Section } from './Section'
import { SectionLabel } from './SectionHeader'

export function Contact() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`
    }
  }

  return (
    <Section id="contact" label={t('contact.label')}>
      <div className="container-page pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="card card-xl p-7 md:p-12 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <SectionLabel index="04" label={t('contact.label')} />

              <h2 className="mt-6 text-[clamp(2.5rem,5.6vw,4.5rem)] leading-[1] font-light tracking-[-0.045em] text-ink">
                {t('contact.heading')}
              </h2>

              <p className="mt-6 max-w-[52ch] text-[1rem] leading-[1.7] text-muted">{t('contact.desc')}</p>

              <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-solid mt-8">
                {t('navCta')}
                <LuArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <p className="chip label-mono text-ink">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {t('hero.avail')}
              </p>

              <div className="mt-6 rounded-xl border border-line bg-ground/60 p-4">
                <p className="label-mono text-faint">{t('contact.copyHint')}</p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-mono text-[0.9rem] break-all text-ink underline decoration-line underline-offset-[5px] hover-fine:decoration-ink/40"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyEmail()}
                    aria-label={t('ui.copyEmail')}
                    className="grid size-10 shrink-0 place-items-center rounded-lg border border-line-strong text-muted hover-fine:border-ink/30 hover-fine:text-ink"
                  >
                    {copied ? <LuCheck aria-hidden="true" className="size-4" /> : <LuCopy aria-hidden="true" className="size-4" />}
                  </button>
                </div>

                <span aria-live="polite" className="sr-only">
                  {copied ? t('contact.copied') : ''}
                </span>
              </div>

              <ul className="mt-3 grid gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 hover-fine:border-line-strong hover-fine:bg-white/[0.03]"
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
                      <span className="text-[0.95rem] text-ink">{label}</span>
                      <LuArrowUpRight aria-hidden="true" className="ml-auto size-3.5 text-faint" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
