type SectionHeaderProps = {
  label: string,
  heading: string
}

export function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <>
      <p className={'section-counter section-counter-title mb-3'}>{label}</p>
      <h2 className={`font-display font-extrabold text-foreground mb-16 whitespace-pre-line leading-none tracking-[-0.02em] text-[clamp(2.5rem,6vw,5rem)]`}>
        {heading}
      </h2>
    </>
  )
}
