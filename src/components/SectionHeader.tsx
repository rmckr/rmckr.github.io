type SectionHeaderProps = {
  heading: string
}

/** The chapter heading and nothing above it: no number, no eyebrow. The
 *  numbers survive only in the footer's index. */
export function SectionHeader({ heading }: SectionHeaderProps) {
  return <h2 className="max-w-[24ch] text-display text-balance">{heading}</h2>
}
