import { useEffect, type ReactNode } from 'react'
import { NAME } from '@/data/index'
import { LEGAL, legalAddressLines } from '@/data/legal'
import { useTranslation } from '@/i18n/i18n'
import { Logo } from './Logo'

/** One titled block of the page: a hairline, the title, and its prose. */
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="text-lead font-medium text-foreground">{title}</h2>
      <div className="mt-3 grid max-w-[62ch] gap-3 text-body text-muted">{children}</div>
    </section>
  )
}

/** A link out of the page, in the page's own ink, marked by its rule. */
function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-foreground underline decoration-line underline-offset-[5px]"
    >
      {children}
    </a>
  )
}

/** The imprint and the privacy page: the same document head, its own title. */
export function Legal() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${t('legal.title')} · ${NAME}`
  }, [t])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center">
          <a
            href="/"
            aria-label={`RMCKR, ${NAME}`}
            className="transition-opacity duration-200 ease-out hover-fine:opacity-80 motion-reduce:transition-none"
          >
            <Logo />
          </a>
        </div>
      </header>

      <main id="main" className="container-page flex-1 py-16 md:py-24">
        <h1 className="max-w-[20ch] text-display text-balance">{t('legal.title')}</h1>
        <p className="section-lead mt-6">{t('legal.lead')}</p>

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-lead font-medium text-foreground">{t('legal.imprint.heading')}</h2>
          <p className="label mt-4 text-muted">{t('legal.imprint.sub')}</p>
          <address className="mt-3 text-body text-muted not-italic">
            {legalAddressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-3 text-body text-muted">
            {t('legal.imprint.emailLabel')}:{' '}
            <a
              href={`mailto:${LEGAL.email}`}
              className="text-foreground underline decoration-line underline-offset-[5px]"
            >
              {LEGAL.email}
            </a>
          </p>
          <p className="mt-3 max-w-[62ch] text-body text-muted">{t('legal.imprint.note')}</p>
        </section>

        <section className="mt-14">
          <h2 className="max-w-[20ch] text-display text-balance">{t('legal.privacy.heading')}</h2>
          <p className="label mt-3 text-muted">{t('legal.privacy.updated')}</p>
          <p className="mt-4 max-w-[62ch] text-body text-muted">{t('legal.privacy.intro')}</p>
          <p className="mt-3 max-w-[62ch] text-body text-muted">{t('legal.privacy.quiet')}</p>
        </section>

        <Block title={t('legal.privacy.controller.title')}>
          <p>{t('legal.privacy.controller.text', { email: LEGAL.email })}</p>
        </Block>

        <Block title={t('legal.privacy.hosting.title')}>
          <p>{t('legal.privacy.hosting.text')}</p>
          <p>
            <OutLink href={LEGAL.githubPrivacy}>{t('legal.privacy.hosting.link')}</OutLink>
          </p>
        </Block>

        <Block title={t('legal.privacy.github.title')}>
          <p>{t('legal.privacy.github.text')}</p>
        </Block>

        <Block title={t('legal.privacy.storage.title')}>
          <p>{t('legal.privacy.storage.text')}</p>
          <ul className="grid gap-2 pl-4">
            <li className="list-disc">{t('legal.privacy.storage.lang')}</li>
            <li className="list-disc">{t('legal.privacy.storage.cache')}</li>
          </ul>
          <p>{t('legal.privacy.storage.basis')}</p>
        </Block>

        <Block title={t('legal.privacy.contact.title')}>
          <p>{t('legal.privacy.contact.text')}</p>
        </Block>

        <Block title={t('legal.privacy.rights.title')}>
          <p>{t('legal.privacy.rights.text')}</p>
        </Block>

        <a
          href="/"
          className="press label mt-14 inline-block py-2 text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
        >
          {t('legal.back')}
        </a>
      </main>
    </div>
  )
}
