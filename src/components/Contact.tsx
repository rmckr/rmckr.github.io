import { useState } from 'react'
import { Trans } from 'react-i18next'
import { LuArrowUpRight, LuExternalLink } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { highlightComponents } from '@/lib/trans'
import { CONTACT_EMAIL, socialLinks } from '../data'
import { useTranslation } from '../i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

/** One giant email line — the band and its inversion sweep share it, so the
    two copies can't drift. `invert` is the sweep's copy (text on accent). */
function GiantRow({ invert = false }: { invert?: boolean }) {
  const tone = invert ? 'text-bg' : 'text-accent'

  // The base copy rides word-mask's reveal; its transition shorthand would
  // reset a delay utility, so the stagger delay stays inline (SectionHeader
  // does the same). The sweep copy has no mask, so it needs no delay.
  const email = (
    <span
      className={cn(
        'font-wordmark text-giant whitespace-nowrap font-normal tracking-tight',
        tone
      )}
      style={invert ? undefined : { transitionDelay: '150ms' }}
    >
      {CONTACT_EMAIL}
    </span>
  )

  return (
    <div className={'py-10'}>
      <div className={'container-page flex items-center justify-between'}>
        {invert ? email : <span className={'word-mask'}>{email}</span>}
        {/* Baseline-aligned: a 1em square sits on the baseline, its centre
            above the text's optical centre */}
        <span aria-hidden={'true'} className={cn('inline-block text-giant', tone)}>
          <LuArrowUpRight className={'transition-transform duration-200 group-hover:translate-x-2 group-hover:-translate-y-2'} />
        </span>
      </div>
    </div>
  )
}

export function Contact() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [addrRef, setAddrRef] = useState<HTMLElement | null>(null)

  const copyEmail = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      ok = true
    } catch {
      // Clipboard refused (insecure context, permissions) — fall through and
      // select the address instead so it can be copied by hand.
    }

    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      return
    }

    const selection = window.getSelection()
    if (!selection || !addrRef) return
    const range = document.createRange()
    range.selectNodeContents(addrRef)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  return (
    // See-through by design so the ambient grid runs right through this section
    <Section id={'contact'}>
      <SectionHeader label={t('contact.label')} heading={t('contact.heading')} />

      <div className={'flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between'}>
        <p className={'copy max-w-xl'}>
          <Trans i18nKey={'contact.desc'} components={highlightComponents} />
        </p>

        <div className={'stagger flex flex-wrap items-center gap-4'}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={'_blank'}
              rel={'noreferrer'}
              className={'btn-secondary group'}
            >
              <link.icon size={14} className={'icon-nudge'} />
              {link.label}
              <LuExternalLink size={11} className={'icon-nudge'} />
            </a>
          ))}
        </div>
      </div>

      {/* Full-bleed band (svw so classic scrollbars can't cause horizontal
          overflow): the giant email sits on the moving floor; on hover-fine an
          accent layer sweeps across and inverts it — the glyphs never move. */}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className={'group relative mx-[calc(50%-50svw)] mt-16 block overflow-hidden'}
      >
        <span aria-hidden={'true'} className={'wipe-edge absolute inset-x-0 top-0 h-px bg-accent'} />
        <span
          aria-hidden={'true'}
          className={'wipe-edge absolute inset-x-0 bottom-0 h-px bg-accent'}
          style={{ transitionDelay: '120ms' }}
        />

        <GiantRow />

        {/* Inversion layer — parked off-band; its inner copy counter-slides so
            the text stays perfectly still while the accent edge sweeps across */}
        <div
          aria-hidden={'true'}
          className={
            'pointer-events-none absolute inset-0 -translate-x-full overflow-hidden bg-accent transition-transform duration-500 ease-out-expo group-hover-fine:translate-x-0'
          }
        >
          <div
            className={
              'translate-x-full transition-transform duration-500 ease-out-expo group-hover-fine:translate-x-0'
            }
          >
            <GiantRow invert />
          </div>
        </div>
      </a>

      {/* Click copies, drag selects — no separate button needed */}
      <button
        type={'button'}
        onClick={() => void copyEmail()}
        className={
          'mt-8 inline-flex select-text items-baseline gap-2 font-mono text-sm text-muted transition-colors duration-200 hover:text-foreground'
        }
      >
        {copied ? t('contact.copied') : t('contact.copyHint')}
        <span ref={setAddrRef} className={'text-foreground'}>
          {CONTACT_EMAIL}
        </span>
      </button>
    </Section>
  )
}
