import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionLabelProps = {
  index: string
  label: string
  className?: string
}

/** Chapter mark: number and name. Shared by every section and the contact block. */
export function SectionLabel({ index, label, className }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="label-mono text-faint">{index}</span>
      <span className="label-mono text-ink">{label}</span>
    </div>
  )
}

type SectionHeaderProps = {
  index: string
  label: string
  heading: string
  aside?: ReactNode
}

export function SectionHeader({ index, label, heading, aside }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
      <div>
        <SectionLabel index={index} label={label} />
        <h2 className="mt-5 max-w-[24ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-[-0.04em] text-balance">
          {heading}
        </h2>
      </div>
      {aside ? <div className="shrink-0 md:pb-1.5">{aside}</div> : null}
    </div>
  )
}
