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

export type Skill = {
  name: string
  /** Self-assessed proficiency 1-3 */
  tier: 1 | 2 | 3
  icon: IconType
}

export const skills: Skill[] = [
  { name: 'TypeScript', tier: 3, icon: SiTypescript },
  { name: 'JavaScript', tier: 3, icon: SiJavascript },
  { name: 'HTML / CSS', tier: 3, icon: SiHtml5 },
  { name: 'React', tier: 3, icon: SiReact },
  { name: 'Node.js', tier: 3, icon: SiNodedotjs },
  { name: 'Linux', tier: 3, icon: SiLinux },

  { name: 'Express', tier: 2, icon: SiExpress },
  { name: 'Vue', tier: 2, icon: SiVuedotjs },
  { name: 'Python', tier: 2, icon: SiPython },
  { name: 'Tailwind CSS', tier: 2, icon: SiTailwindcss },
  { name: 'Vite', tier: 2, icon: SiVite },
  { name: 'Docker', tier: 2, icon: SiDocker },
  { name: 'Git', tier: 2, icon: SiGit },
  { name: 'GitHub Actions', tier: 2, icon: SiGithubactions },
  { name: 'WebSockets', tier: 2, icon: SiSocketdotio },

  { name: 'MongoDB', tier: 1, icon: SiMongodb },
  { name: 'C', tier: 1, icon: SiC },
  { name: 'Java', tier: 1, icon: FaJava },
  { name: 'SQL', tier: 1, icon: LuDatabase }
]

// ── Skill groups ──────────────────────────────────────────────────────────────

/** The four groups, each with the skills that carry it. The names live in i18n;
 *  this is only the pairing. */
export const skillGroups = [
  { key: 'engineering', skills: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C', 'Git'] },
  { key: 'fullstack', skills: ['Node.js', 'Express', 'WebSockets', 'SQL', 'MongoDB'] },
  { key: 'frontend', skills: ['React', 'Vue', 'HTML / CSS', 'Tailwind CSS', 'Vite'] },
  { key: 'systems', skills: ['Linux', 'Docker', 'GitHub Actions'] }
] as const

// ── Featured GitHub repos ─────────────────────────────────────────────────────

type FeaturedRepo = {
  name: string
  /** The suffix of its one line in i18n. */
  id: string
  /** Cover in public/ — without one the slot is a typographic cover. */
  image?: string
}

/** The hand-picked repos on the Projects ring, in display order. */
export const featuredRepos: FeaturedRepo[] = [
  { name: 'kalliope', id: 'kalliope', image: '/images/repos/kalliope.webp' },
  { name: 'suitbot', id: 'suitbot', image: '/images/repos/suitbot.webp' },
  { name: 'rasputin', id: 'rasputin', image: '/images/repos/rasputin.webp' },
  { name: 'rmckr.github.io', id: 'portfolio', image: '/images/repos/rmckr.github.io.webp' }
]
