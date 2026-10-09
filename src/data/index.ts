import { IconType } from 'react-icons'
import { FaGithub, FaJava, FaLinkedin } from 'react-icons/fa'
import { LuDatabase } from 'react-icons/lu'
import {
  SiC,
  SiDocker,
  SiExpress,
  SiGit,
  SiGithubactions,
  SiHtml5,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiSocketdotio,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiVuedotjs
} from 'react-icons/si'

// ── Static data ───────────────────────────────────────────────────────────────
// Non-translated, non-fetched data

export const NAME = 'Lukas Romacker'
export const GITHUB_USERNAME = 'rmckr'
export const CONTACT_EMAIL = 'hello@rmckr.com'

export const socialLinks = [
  { label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}`, icon: FaGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lukas-romacker/', icon: FaLinkedin }
]

// ── Skills ────────────────────────────────────────────────────────────────────

export type SkillTag = 'lang' | 'frontend' | 'backend' | 'tool' | 'db' | 'infra'

export type Skill = {
  name: string
  /** Self-assessed proficiency 1-3 */
  tier: 1 | 2 | 3
  tag: SkillTag
  icon: IconType
}

export const skills: Skill[] = [
  { name: 'TypeScript', tier: 3, tag: 'lang', icon: SiTypescript },
  { name: 'JavaScript', tier: 3, tag: 'lang', icon: SiJavascript },
  { name: 'HTML / CSS', tier: 3, tag: 'frontend', icon: SiHtml5 },
  { name: 'React', tier: 3, tag: 'frontend', icon: SiReact },
  { name: 'Node.js', tier: 3, tag: 'backend', icon: SiNodedotjs },
  { name: 'Linux', tier: 3, tag: 'infra', icon: SiLinux },

  { name: 'Express', tier: 2, tag: 'backend', icon: SiExpress },
  { name: 'Vue', tier: 2, tag: 'frontend', icon: SiVuedotjs },
  { name: 'Python', tier: 2, tag: 'lang', icon: SiPython },
  { name: 'Tailwind CSS', tier: 2, tag: 'frontend', icon: SiTailwindcss },
  { name: 'Vite', tier: 2, tag: 'tool', icon: SiVite },
  { name: 'Docker', tier: 2, tag: 'infra', icon: SiDocker },
  { name: 'Git', tier: 2, tag: 'tool', icon: SiGit },
  { name: 'GitHub Actions', tier: 2, tag: 'infra', icon: SiGithubactions },
  { name: 'WebSockets', tier: 2, tag: 'backend', icon: SiSocketdotio },

  { name: 'MongoDB', tier: 1, tag: 'db', icon: SiMongodb },
  { name: 'C', tier: 1, tag: 'lang', icon: SiC },
  { name: 'Java', tier: 1, tag: 'lang', icon: FaJava },
  { name: 'SQL', tier: 1, tag: 'db', icon: LuDatabase }
]

// ── Tag accent colors ─────────────────────────────────────────────────────────

export const tagColors: Record<SkillTag, string> = {
  lang: '#F472B6', // pink
  frontend: '#60A5FA', // blue
  backend: '#F97316', // orange
  tool: '#4ADE80', // green
  db: '#FACC15', // yellow
  infra: '#D8B4FE' // lavender
}
