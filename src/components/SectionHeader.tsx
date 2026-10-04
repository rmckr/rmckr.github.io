type SectionHeaderProps = {
  label: string,
  heading: string
}

export function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <>
      <p className={'section-counter-title mb-3'}>{label}</p>
      <h2 className={'mb-16 whitespace-pre-line text-heading tracking-display'}>
        {heading}
      </h2>
    </>
  )
}
