import type { ReactNode } from 'react'
import type { SectionId } from '@/data/sections'
import { sections } from '@/data/sections'
import { useTranslation } from '@/i18n/i18n'

type SectionProps = {
  id: SectionId
  children: ReactNode
  /** `false` for a section that owns its vertical rhythm end to end. */
  padded?: boolean
}

/** Page section: landmark name comes from `sections`, so it cannot drift from the label. */
export function Section({ id, children, padded = true }: SectionProps) {
  const { t } = useTranslation()
  const labelKey = sections.find((section) => section.id === id)?.labelKey

  return (
    <section id={id} aria-label={labelKey && t(labelKey)} className="relative">
      <div className={padded ? 'container-page py-16 md:py-24' : 'container-page'}>{children}</div>
    </section>
  )
}
