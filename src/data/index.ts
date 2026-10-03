import { IconType, SiDocker, SiGit, SiMongodb, SiNodedotjs, SiPython, SiReact, SiTypescript } from '@icons-pack/react-simple-icons'

// ── Static data ───────────────────────────────────────────────────────────────
// All non-translated, non-fetched data lives here. Change values freely;
// nothing else depends on the specific numbers or keys.

export const NAME = 'Lukas Romacker'
export const GITHUB_USERNAME = 'rmckr'
export const CONTACT_EMAIL = 'lukas@rmckr.com'

// ── Skills ────────────────────────────────────────────────────────────────────

export type SkillTag = 'lang' | 'frontend' | 'backend' | 'tool' | 'db' | 'infra'

export type Skill = {
  name: string,
  /** Self-assessed proficiency 1-3 */
  tier: 1 | 2 | 3,
  tag: SkillTag,
  icon: IconType
}

export const skills: Skill[] = [
  { name: 'TypeScript', tier: 3, tag: 'lang', icon: SiTypescript },
  { name: 'React', tier: 3, tag: 'frontend', icon: SiReact },
  { name: 'Node.js', tier: 3, tag: 'backend', icon: SiNodedotjs },
  { name: 'Python', tier: 2, tag: 'lang', icon: SiPython },
  { name: 'MongoDB', tier: 1, tag: 'db', icon: SiMongodb },
  { name: 'Docker', tier: 2, tag: 'infra', icon: SiDocker },
  { name: 'Git', tier: 2, tag: 'tool', icon: SiGit }
]

// ── Tag accent colors ─────────────────────────────────────────────────────────

export const tagColors: Record<SkillTag, string> = {
  lang: '#7c6cd4',
  frontend: '#3178c6',
  backend: '#68a063',
  tool: '#e5834a',
  db: '#336791',
  infra: '#326ce5'
}
