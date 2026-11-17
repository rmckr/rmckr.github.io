import { useEffect, useState } from 'react'
import { LuArrowUpRight, LuCheck, LuCopy, LuMail } from 'react-icons/lu'
import { CONTACT_EMAIL, socialLinks } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function Contact() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`
    }
  }

  return (
    <Section id="contact">
      {/* The section's own air: no fixed height, just padding above and below. */}
      <div className="py-4 md:py-12">
        <SectionHeader heading={t('contact.heading')} />

        {/* One rule, down the body only: the heading keeps its own row, so the
            divider never reaches it, and the section carries no horizontal rules. */}
        <div className="mt-12 flex flex-col gap-10 md:mt-14 lg:flex-row lg:gap-0">
          <div className="lg:w-1/2 lg:pr-(--gutter)">
            <p className="label flex items-center gap-2 text-foreground">
              <span aria-hidden="true" className="relative size-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent motion-reduce:animate-none" />
                <span className="relative block size-full rounded-full bg-accent" />
              </span>
              {t('contact.avail')}
            </p>

            <p className="section-lead mt-4">{t('contact.desc')}</p>

            <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-solid mt-8">
              {t('cta')}
              <LuArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>

          <div className="lg:w-1/2 lg:border-l lg:border-line lg:pl-(--gutter)">
            <div className="flex min-w-0 items-center justify-between gap-3">
              {/* Inline rather than flex, so the accent rule runs the address's
                  own length and stops at the address. The rule is drawn at rest
                  in transparent ink and only changes colour, because a
                  decoration's line cannot transition but its colour can. */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="min-w-0 text-body break-all text-foreground underline decoration-2 decoration-transparent underline-offset-[5px] transition-[text-decoration-color] duration-200 ease-out hover-fine:decoration-accent motion-reduce:transition-none"
              >
                <LuMail aria-hidden="true" className="mr-2 inline-block size-4 align-[-0.2em] text-muted" />
                {CONTACT_EMAIL}
              </a>
              <div className="flex shrink-0 items-center gap-3">
                {/* The words keep their slot at rest, so confirming never
                    reflows the address beside them. The live region below
                    already announces the change, so this copy is hidden. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'label text-muted transition-opacity duration-120 ease-out motion-reduce:transition-none',
                    copied ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {t('contact.copied')}
                </span>
                <button
                  type="button"
                  onClick={() => void copyEmail()}
                  aria-label={t('ui.copyEmail')}
                  className="press grid size-10 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface/50 text-muted transition-[color,background-color] duration-200 ease-out hover-fine:bg-white/6 hover-fine:text-foreground motion-reduce:transition-none"
                >
                  {/* Both marks stay in the one cell, so the swap is a
                      cross-fade in place and the button never changes size. */}
                  <span aria-hidden="true" className="relative grid size-4 place-items-center">
                    <LuCopy
                      className={cn(
                        'absolute size-4 transition-[opacity,scale] duration-120 ease-out motion-reduce:transition-none',
                        copied ? 'scale-94 opacity-0' : 'opacity-100'
                      )}
                    />
                    <LuCheck
                      className={cn(
                        'absolute size-4 transition-[opacity,scale] duration-120 ease-out motion-reduce:transition-none',
                        copied ? 'opacity-100' : 'scale-94 opacity-0'
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>

            <span aria-live="polite" className="sr-only">
              {copied ? t('contact.copied') : ''}
            </span>

            <ul className="mt-8 grid gap-1">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 py-2.5 text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="text-body">{label}</span>
                    <LuArrowUpRight aria-hidden="true" className="ml-auto size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
