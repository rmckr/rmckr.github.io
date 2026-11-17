import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import { GITHUB_USERNAME, NAME } from '@/data/index'
import type { GitHubData } from '@/data/loadGitHub'
import { loadGitHub } from '@/data/loadGitHub'
import { useTranslation } from '@/i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

const PROFILE = `https://github.com/${GITHUB_USERNAME}`

/** The four totals the account is read by, in display order. */
const STAT_KEYS = ['stars', 'forks', 'pullRequests', 'issues'] as const

/** A digit's reel, zero to nine down the window, so every figure starts at zero
 *  and each digit travels up to its own number. */
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * One figure on the experience counter's own dials: a window per digit and a
 * reel of ten rows, React writing the row in view as `--d`. `dial` and
 * `dial-reel` hold the geometry, the spring and the reduced-motion snap, so a
 * figure spins to its number and lands in the detent instead of counting
 * through values, and no frame loop is needed. The rows are decorative to a
 * screen reader, which is given the formatted total beside them.
 */
function StatFigure({
  value,
  locale,
  landed,
  failed
}: {
  value: number | null
  locale: string
  landed: boolean
  failed: boolean
}) {
  const { t } = useTranslation()
  const digits = value === null ? [] : String(value).split('').map(Number)

  return (
    <>
      <span className="sr-only">
        {value === null ? (failed ? t('github.unavailable') : '') : value.toLocaleString(locale)}
      </span>
      <span
        aria-hidden="true"
        className="text-display-lg flex h-lh items-center leading-[1.1] tracking-normal tabular-nums"
      >
        {value === null
          ? failed
            ? <span className="label text-muted">{t('github.unavailable')}</span>
            : '\u00a0'
          : digits.map((digit, index) => (
              <span key={index} className="dial block">
                <span
                  className="dial-reel block"
                  style={{ '--d': landed ? digit : 0 } as CSSProperties}
                >
                  {ROWS.map((row) => (
                    <span key={row} className="block">
                      {row}
                    </span>
                  ))}
                </span>
              </span>
            ))}
      </span>
    </>
  )
}

export function GitHub() {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<GitHubData | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [counted, setCounted] = useState(false)
  const gridRef = useRef<HTMLDListElement>(null)

  // The figures are the only fetched thing in the section: the name, the handle
  // and the link are static, so the chapter is complete before the request is.
  useEffect(() => {
    let live = true

    loadGitHub(attempt > 0)
      .then((next) => {
        if (live) setData(next)
      })
      .catch(() => {
        if (live) setFailed(true)
      })

    return () => {
      live = false
    }
  }, [attempt])

  // The four figures land once, the first time the grid is half on screen. Under
  // reduced motion the reels drop their spring, so the figures simply arrive.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setCounted(true)
        observer.disconnect()
      },
      { threshold: 0.5 }
    )

    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  const totals = data
    ? {
        stars: data.totalStars,
        forks: data.totalForks,
        pullRequests: data.prCount,
        issues: data.issueCount
      }
    : null

  return (
    <Section id="github">
      <SectionHeader heading={t('github.heading')} />
      <p className="section-lead mt-6">{t('github.lead')}</p>

      <div className="mt-12 flex flex-col gap-10 md:mt-14 lg:flex-row lg:gap-0">
        <div className="lg:w-1/2 lg:pr-(--gutter)">
          <div className="flex items-center gap-4">
            {data ? (
              <img
                src={data.user.avatar_url}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="size-20 shrink-0 rounded-lg border border-line"
              />
            ) : (
              <span
                aria-hidden="true"
                className="size-20 shrink-0 rounded-lg border border-line bg-surface"
              />
            )}

            <div className="min-w-0">
              <p className="text-lead font-medium">{NAME}</p>
              {/* The handle is set as text, not as a label: it is an address,
                  and forcing it into caps would spell a different one. */}
              <p className="mt-1 text-body text-muted">@{GITHUB_USERNAME}</p>
            </div>
          </div>

          {data?.user.bio && (
            <p className="mt-6 max-w-[52ch] text-body text-muted">{data.user.bio}</p>
          )}

          {/* The section's one path out, in the hero's link-out voice rather
              than a treatment of its own. */}
          <a
            href={PROFILE}
            target="_blank"
            rel="noreferrer noopener"
            className="label mt-6 inline-flex items-center gap-2 py-1.5 text-muted transition-[color] duration-200 ease-out hover-fine:text-foreground motion-reduce:transition-none"
          >
            {t('github.viewProfile')}
            <LuArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <div className="lg:w-1/2 lg:border-l lg:border-line lg:pl-(--gutter)">
          <dl
            ref={gridRef}
            aria-busy={!data && !failed}
            className="grid grid-cols-2 gap-x-4 gap-y-8"
          >
            {STAT_KEYS.map((key) => (
              <div key={key}>
                {/* The name starts on the figure's own left edge — the window's
                    inner inset — so each cell reads on one axis. */}
                <dt className="label pl-6 text-muted">{t(`github.stats.${key}`)}</dt>
                <dd className="readout mt-3 rounded-2xl px-6 py-5 shadow-[inset_0_4px_14px_rgb(0_0_0/0.7)]">
                  <StatFigure
                    value={totals ? totals[key] : null}
                    locale={i18n.language}
                    landed={counted}
                    failed={failed && !data}
                  />
                </dd>
              </div>
            ))}
          </dl>

          {/* A failed fetch keeps the four names in place and says so below
              them, rather than emptying the chapter down to an apology. */}
          {failed && !data && (
            <div className="mt-6 flex flex-col items-start gap-4">
              <p className="text-body text-muted">{t('github.error')}</p>
              <button
                type="button"
                onClick={() => {
                  setFailed(false)
                  setAttempt((count) => count + 1)
                }}
                className="btn"
              >
                {t('github.retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
