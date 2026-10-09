import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type SectionProps = {
  id: string
  children: ReactNode
  /** Extra classes for the full-bleed <section> */
  className?: string
  /** Extra classes for the inner content wrapper (the element that fades in) */
  contentClassName?: string
}

export function Section({ id, children, className, contentClassName }: SectionProps) {
  const ref = useReveal()

  return (
    <section id={id} className={cn('py-32', className)}>
      <div className={'container-page'}>
        <div ref={ref} className={cn('reveal', contentClassName)}>
          {children}
        </div>
      </div>
    </section>
  )
}
