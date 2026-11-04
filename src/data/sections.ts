// Content only: the page's sections in order, with the i18n key each one's
// label comes from. No component imports — rendering is the UI layer's job.
// GitHub is left out for now; its content stays in src/data/index.ts.
export const sections = [
  { id: 'about', labelKey: 'about.label' },
  { id: 'experience', labelKey: 'experience.label' },
  { id: 'skills', labelKey: 'skills.label' },
  { id: 'contact', labelKey: 'contact.label' }
] as const

export type SectionId = (typeof sections)[number]['id']
