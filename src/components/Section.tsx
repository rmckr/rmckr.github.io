import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type SectionProps = {
  id: string
  children: ReactNode
}

export function Section({ id, children }: SectionProps) {
  const ref = useReveal()
  return (
    <section id={id} className={'relative min-h-svh bg-bg py-32'}>
      <div className={'container-page'}>
        <div ref={ref} className={'reveal'}>
          {children}
        </div>
      </div>
    </section>
  )
}
