import { Trans } from 'react-i18next'
import { LuArrowDown } from 'react-icons/lu'
import { useTranslation } from '@/i18n/i18n'
import { highlightComponents } from '@/lib/trans'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function About() {
  const { t } = useTranslation()

  return (
    <Section id="about">
      <SectionHeader heading={t('about.heading')} />

      <div className="mt-12 flex flex-col gap-y-10 md:mt-14 lg:flex-row lg:justify-between">
        {/* Stacked below `lg`: half the container would leave the prose under 40
            characters, so the plate keeps its measure and the split waits. */}
        <figure className="max-w-[18rem] lg:w-[33%] lg:max-w-none">
          {/* The frame misses the cutout on purpose: the photo is pulled up
              through its top rule, so the crown breaks the outline instead of
              sitting inside a box, and it is inset from the sides so the
              shoulders never cross a rule. Reserving the same 3rem above keeps
              the overhang in the flow. */}
          <div className="pt-12">
            <div className="rounded-lg border-4 border-foreground">
              <img
                src="/images/portrait-1200.webp"
                alt=""
                width={1200}
                height={1107}
                loading="lazy"
                decoding="async"
                className="block aspect-4/5 w-full -mt-12 rounded-sm object-cover object-[center_14%]"
              />
            </div>
          </div>
          {/* The mark itself, not its typesetting: the scan's ink is in the
              asset's alpha, and `.signature` masks it over `foreground`, so the
              ink is the page's own. Nothing hangs off the frame's foot — the
              signature signs the plate from below. */}
          <div aria-hidden="true" className="signature mt-4 w-56" />
        </figure>

        {/* From `lg` the plate is the taller column, so the prose sits centred
            against its height instead of hanging from the top with the action
            stranded at the end. */}
        <div className="flex flex-col justify-center lg:w-1/2 lg:pl-(--gutter)">
          <p className="max-w-[52ch] text-body text-muted">
            <Trans i18nKey="about.p1" components={highlightComponents} />
          </p>
          <p className="mt-5 max-w-[52ch] text-body text-muted">
            <Trans i18nKey="about.p2" components={highlightComponents} />
          </p>

          {/* The page's one primary action: the only red fill outside the
              card surfaces. */}
          <a
            href="/Lukas-Romacker-Resume.pdf"
            download
            className="btn btn-solid mt-8 self-start"
          >
            {t('about.downloadCv')}
            <LuArrowDown aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </Section>
  )
}
