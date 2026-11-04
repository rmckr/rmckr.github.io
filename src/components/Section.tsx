import type { ReactNode } from 'react'
import type { SectionId } from '@/data/sections'
import { cn } from '@/lib/utils'

type SectionProps = {
  id: SectionId
  /** Landmark name; each section is its own region. */
  label: string
  children: ReactNode
  className?: string
}

export function Section({ id, label, children, className }: SectionProps) {
  return (
    <section id={id} aria-label={label} className={cn('relative', className)}>
      {children}
    </section>
  )
}
