import { LuArrowDown, LuArrowUpRight } from 'react-icons/lu'
import { CONTACT_EMAIL, NAME } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'
import { Blueprint } from './Blueprint'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="top"
      className="relative isolate flex h-svh flex-col overflow-hidden pt-24 pb-6 md:pt-28 md:pb-8"
    >
      {/* The page's only texture: the blueprint drawing, isolated behind the
          content and nothing else, dissolving into the ground at the foot so it
          never ends on a rule. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Blueprint />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container-page flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">{NAME}</h1>

        {/* The text holds the left of the fold and is centred between the bar
            and the link out; the right is the card's, which Projects takes over
            as the page scrolls. */}
        <div data-hero-center className="flex min-h-0 flex-1 items-center">
          <div className="w-full lg:w-[56%]">
            <p
              aria-hidden="true"
              className="wordmark text-[clamp(4rem,12vw,9.5rem)] leading-[0.8]"
            >
              <span className="text-accent">{'//'}</span>
              RMCKR
            </p>

            {/* The mark is the handle; this line is the person it stands for.
                Set in the text face, mixed case, so the name answers the mark
                in a quiet voice instead of echoing it in the same shout. */}
            <p
              aria-hidden="true"
              className="mt-3 text-[clamp(1.25rem,2.2vw,2rem)] font-medium leading-tight md:mt-4"
            >
              {NAME}
            </p>

            <p className="mt-6 max-w-[22ch] text-display-lg text-balance md:mt-8">
              {t('hero.tagline')}
            </p>
          </div>

          {/* The card's slot: its right edge is the fold's right gutter, which
              the projects card hangs from and measures. */}
          <div aria-hidden="true" data-hero-gutter className="hidden min-h-0 flex-1 lg:block" />
        </div>

        {/* The fold closes on its one primary action, with the way into the
            page beside it: the mail first, the portfolio second. */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-solid">
            {t('cta')}
            <LuArrowUpRight aria-hidden="true" className="size-4" />
          </a>

          <a
            href="#projects"
            data-scroll-duration="1.1"
            className="label inline-flex items-center gap-2 py-1.5 text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
          >
            {t('hero.viewPortfolio')}
            <LuArrowDown aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
