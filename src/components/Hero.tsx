import { FaGithub } from 'react-icons/fa'
import { LuArrowDown } from 'react-icons/lu'
import { CONTACT_EMAIL, GITHUB_USERNAME, NAME } from '@/data/index'
import { useTranslation } from '@/i18n/i18n'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section id="top" className="relative pt-28 md:pt-36">
      <div className="container-page">
        <div className="grid grid-cols-12 items-end gap-x-8 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip label-mono text-ink">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {t('hero.avail')}
              </span>
              <span className="chip label-mono text-muted">{t('hero.location')}</span>
            </div>

            <h1 className="mt-8 text-[clamp(3.25rem,9.5vw,7.5rem)] leading-[0.92] font-light tracking-[-0.045em] text-ink">
              <span className="block">Lukas</span>
              <span className="block">
                Romacker<span className="text-accent">.</span>
              </span>
            </h1>

            <p className="mt-8 max-w-[44ch] text-[1.0625rem] leading-[1.65] text-muted">{t('hero.tagline')}</p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#about" className="btn btn-solid">
                {t('hero.viewPortfolio')}
                <LuArrowDown aria-hidden="true" className="size-4" />
              </a>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn"
              >
                <FaGithub aria-hidden="true" className="size-4" />
                {t('hero.github')}
              </a>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <figure className="card p-2">
              <div className="overflow-hidden rounded-lg bg-raise">
                <img
                  src="/images/portrait-1200.webp"
                  srcSet="/images/portrait-640.webp 640w, /images/portrait-1200.webp 1200w"
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  alt={NAME}
                  width={1200}
                  height={1107}
                  fetchPriority="high"
                  decoding="async"
                  className="h-[340px] w-full object-cover object-top grayscale sm:h-[440px] lg:h-[clamp(380px,52vh,560px)]"
                />
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 pt-3 pb-1.5">
                <span className="label-mono text-ink">{t('hero.status')}</span>
                <span aria-hidden="true" className="label-mono text-faint">
                  {t('hero.location')}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 md:mt-16">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[0.95rem] text-muted underline decoration-line underline-offset-[5px] hover-fine:text-ink hover-fine:decoration-ink/40"
          >
            {CONTACT_EMAIL}
          </a>
          <span className="label-mono flex items-center gap-2 text-faint">
            {t('hero.scroll')}
            <LuArrowDown aria-hidden="true" className="size-3.5" />
          </span>
        </div>
      </div>
    </section>
  )
}
