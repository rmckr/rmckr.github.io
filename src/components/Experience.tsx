import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from '@/i18n/i18n'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

type ExperienceEntry = {
  title: string
  organisation: string
  period: string
  desc: string
}

/** One digit's dial, high to low, so a digit steps up as the year counts down.
 *  A `0 → 9` step spins the whole dial; at one line per row that reads as a
 *  counter rather than a glitch. */
const DIAL = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

/** `10/2022 — 03/2026` → March 2026, as months since year zero. A year on its
 *  own ends that December; an entry still running (`10/2026 — present`) ends
 *  this month, so the numeral is today. */
function endMonth(period: string) {
  const tail = period.split(/[—–-]/).pop() ?? ''
  const dated = /(\d{1,2})\/(\d{4})/.exec(tail)
  if (dated) return Number(dated[2]) * 12 + Number(dated[1]) - 1
  const year = /\d{4}/.exec(tail)?.[0]
  if (year) return Number(year) * 12 + 11
  const now = new Date()
  return now.getFullYear() * 12 + now.getMonth()
}

export function Experience() {
  const { t } = useTranslation()
  const entries = t('experience.entries', { returnObjects: true }) as unknown as ExperienceEntry[]

  // Newest first: down the rule is back in time.
  const ordered = [...entries].reverse()
  const months = ordered.map((entry) => endMonth(entry.period))
  const milestones = months.join('|')
  const years = months.map((value) => Math.floor(value / 12))
  const digits = String(years[0]).split('').map(Number)

  const listRef = useRef<HTMLOListElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)

  // The centre of the stage — where the numeral sits — is the read line. The
  // date is interpolated between the two ticks that bracket it, so an irregular
  // gap gets its own speed and every month in it passes; the numeral steps a
  // whole year at the turn and holds in between.
  useLayoutEffect(() => {
    const list = listRef.current
    const reels = Array.from(yearRef.current?.querySelectorAll<HTMLElement>('.dial-reel') ?? [])
    if (!list || reels.length === 0) return

    const values = milestones.split('|').map(Number)
    const written: number[] = []

    const read = () => {
      const items = Array.from(list.querySelectorAll<HTMLElement>('li[data-index]'))
      if (items.length === 0) return

      const stageRect = stageRef.current?.getBoundingClientRect()
      const stageHeight = stageRect?.height ?? window.innerHeight
      const readLine = stageRect ? stageRect.top + stageHeight / 2 : window.innerHeight / 2
      const marks = items.map((item) => {
        const rect = item.getBoundingClientRect()
        return rect.top + rect.height / 2
      })

      let month = values[0] ?? 0

      if (readLine >= marks[marks.length - 1]) {
        month = values[values.length - 1] ?? 0
      } else if (readLine > marks[0]) {
        for (let i = 0; i < marks.length - 1; i += 1) {
          if (readLine >= marks[i] && readLine <= marks[i + 1]) {
            const progress = (readLine - marks[i]) / (marks[i + 1] - marks[i])
            month = Math.round(values[i] + (values[i + 1] - values[i]) * progress)
            break
          }
        }
      }

      String(Math.floor(month / 12))
        .split('')
        .map(Number)
        .forEach((digit, index) => {
          const row = DIAL.length - 1 - digit
          if (written[index] === row) return
          written[index] = row
          reels[index]?.style.setProperty('--d', String(row))
        })
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)

    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [milestones])

  return (
    <Section id="experience" padded={false}>
      {/* Below `sm` the chapter stays in the flow: the pinned scene would take
          the screen the entries need. */}
      <div className="sm:hidden">
        <SectionHeader heading={t('experience.heading')} />
        <p className="section-lead mt-6">{t('experience.desc')}</p>
      </div>

      <div className="relative mt-12 sm:mt-0">
        {/* The spine holds still for the whole scroll. Below `sm` it moves to the
            content's left edge, so the entries keep a timeline with no card: the
            text is indented past it and each tick crosses it. */}
        <div className="pointer-events-none sticky top-0 h-svh">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-2.5 w-0.5 -translate-x-1/2 bg-accent sm:left-1/2"
          />
        </div>

        {/* One screen of sticky scene over the entries: the edge gradient fades
            everything that scrolls through the top and bottom of the stage,
            while the left column is painted over the gradient and stays
            crisp. With no tail, the scene lets go on the scroll where the last
            tick reaches the centre, so the track ends where its content does. */}
        <div ref={stageRef} className="pointer-events-none sticky top-0 mt-[-100svh] z-10 h-svh">
          <div className="relative h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-background),transparent_14%,transparent_86%,var(--color-background))]"
            />

            <div className="pointer-events-auto relative hidden w-1/2 pt-20 pr-(--gutter) sm:block md:pt-24">
              <SectionHeader heading={t('experience.heading')} />
            </div>

            <p className="section-lead pointer-events-auto absolute bottom-14 left-0 hidden sm:block md:bottom-20">
              {t('experience.desc')}
            </p>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 items-center justify-end pr-(--gutter) sm:flex"
            >
              {/* The year: four dials behind one window, the panel padded across
                  only, so its rules are the window's crop lines and the figures
                  slide behind them. React writes the row; `dial` and
                  `dial-reel` hold the geometry, the spring and the
                  reduced-motion snap. */}
              <div
                ref={yearRef}
                className="readout overflow-hidden rounded-2xl px-6 shadow-[inset_0_4px_14px_rgb(0_0_0/0.7)]"
              >
                <div className="text-display-xl flex tracking-normal tabular-nums">
                  {digits.map((_, index) => (
                    <div key={index} className="dial">
                      <div className="dial-reel">
                        {DIAL.map((value) => (
                          <span key={value} className="block">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The track: one entry every half screen, with the air above the first
            tick and below the last that puts the first on the read line as the
            scene pins and lets go only once the last has been read. */}
        <ol ref={listRef} className="relative mt-[-100svh] sm:py-[25svh] ">
          {ordered.map((entry, index) => (
            <li
              key={entry.title}
              data-index={index}
              className="relative flex min-h-svh items-center sm:min-h-[50svh]"
            >
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-2.5 h-0.5 w-6 -translate-1/2 bg-accent sm:left-1/2"
              />

              <div className="w-full sm:grid sm:grid-cols-2">
                <div className="relative pl-10 sm:col-start-2 sm:pl-(--gutter)">
                  <div className="relative">
                    <span className="block text-display-lg tabular-nums sm:hidden">
                      {years[index]}
                    </span>

                    <p className="label mt-3 text-muted sm:mt-0">{entry.period}</p>
                    <h3 className="mt-2.5 text-lead font-medium text-foreground">
                      {entry.title}
                    </h3>
                    <p className="mt-1.5 text-body text-muted">{entry.organisation}</p>
                    <p className="mt-4 max-w-[44ch] text-body text-muted">{entry.desc}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
