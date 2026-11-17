// Content only: the page's sections in order, with the i18n key each one's
// label comes from. No component imports — rendering is the UI layer's job.
export const sections = [
  { id: 'projects', labelKey: 'projects.label' },
  { id: 'about', labelKey: 'about.label' },
  { id: 'experience', labelKey: 'experience.label' },
  { id: 'skills', labelKey: 'skills.label' },
  { id: 'github', labelKey: 'github.label' },
  { id: 'contact', labelKey: 'contact.label' }
] as const

export type SectionId = (typeof sections)[number]['id']
