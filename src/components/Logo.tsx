import { NAME } from '@/data/index'

/** The favicon's two slashes, set in white on a red tile, plus the wordmark. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent">
        <svg viewBox="0 0 100 100" className="size-3.5 text-white" aria-hidden="true" focusable="false">
          <path d="M37 8H54L28 92H11L37 8ZM74 8H91L65 92H48L74 8Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[0.9rem] leading-none font-medium tracking-[-0.01em] text-ink">
        <span className="sr-only">{NAME}</span>
        <span aria-hidden="true">RMCKR</span>
      </span>
    </span>
  )
}
