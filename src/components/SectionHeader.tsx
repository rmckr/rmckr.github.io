type SectionHeaderProps = {
  label: string,
  heading: string
}

export function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <>
      <p className={'mb-3 section-counter-title'}>{label}</p>
      <h2 className={'mb-16 text-heading tracking-display whitespace-pre-line'}>
        {heading}
      </h2>
    </>
  )
}
