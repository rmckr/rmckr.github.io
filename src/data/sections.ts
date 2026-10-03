import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Experience } from '@/components/Experience'
import { GitHubSection } from '@/components/GitHubSection'
import { Skills } from '@/components/Skills'

export const sections = [
  { id: 'about', labelKey: 'about.label', Section: About },
  { id: 'experience', labelKey: 'experience.label', Section: Experience },
  { id: 'skills', labelKey: 'skills.label', Section: Skills },
  { id: 'github', labelKey: 'github.label', Section: GitHubSection },
  { id: 'contact', labelKey: 'contact.label', Section: Contact }
] as const
