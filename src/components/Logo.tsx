import { cn } from '@/lib/utils'

type LogoProps = { className?: string }

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('font-mono font-medium tracking-widest text-foreground', className)}>
      {/* eslint-disable-next-line @eslint-react/jsx-no-comment-textnodes */}
      <span className={'text-accent'}>//</span>
      RMCKR
    </span>
  )
}
