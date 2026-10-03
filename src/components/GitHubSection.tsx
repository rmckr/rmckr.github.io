import SiGithub from '@icons-pack/react-simple-icons/icons/SiGithub'
import {
  ArrowUpRight,
  ExternalLinkIcon,
  FileExclamationPointIcon,
  GitFork,
  GitForkIcon,
  GitPullRequestIcon,
  MapPin,
  Star,
  StarIcon,
  UserRoundGroupIcon
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { GITHUB_USERNAME } from '../data'
import type { GHRepo, GHUser } from '../data/github'
import { useReveal } from '../hooks/useReveal'
import { useTranslation } from '../i18n/i18n'
import { SectionHeader } from './SectionHeader'

// ── GitHub API ────────────────────────────────────────────────────────────────

const CACHE_KEY = `github-section:${GITHUB_USERNAME}`
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

let githubRequest: Promise<GitHubData> | null = null

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return (await response.json()) as T
}

// ── Types ─────────────────────────────────────────────────────────────────────

type LangColors = Record<string, { color: string | null }>

type GitHubData = {
  user: GHUser,
  repos: GHRepo[],
  totalStars: number,
  totalForks: number,
  prCount: number,
  issueCount: number,
  langColors: LangColors
}

type CachedGitHubData = {
  timestamp: number,
  data: GitHubData
}

// ── Cache ─────────────────────────────────────────────────────────────────────

function readCache(): GitHubData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)

    if (!raw) {
      return null
    }

    const cached = JSON.parse(raw) as CachedGitHubData

    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cached.data
  } catch {
    return null
  }
}

function writeCache(data: GitHubData): void {
  try {
    const cached: CachedGitHubData = {
      timestamp: Date.now(),
      data
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage may be unavailable or full.
    // The GitHub request can still succeed without caching.
  }
}

function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

// ── GitHub data loader ────────────────────────────────────────────────────────

async function requestGitHubData(): Promise<GitHubData> {
  const [
    user,
    allRepos,
    prResult,
    issueResult,
    langColors
  ] = await Promise.all([
    fetchJson<GHUser>(
      `https://api.github.com/users/${GITHUB_USERNAME}`
    ),

    fetchJson<GHRepo[]>(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=100`
    ),

    fetchJson<{ total_count: number }>(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:pr&per_page=1`
    ),

    fetchJson<{ total_count: number }>(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:issue&per_page=1`
    ),

    fetchJson<LangColors>(
      'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json'
    )
  ])

  const ownRepos = allRepos.filter((repo) => !repo.fork)

  const sortedRepos = [...ownRepos].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  )

  const data: GitHubData = {
    user,
    repos: sortedRepos.slice(0, 4),
    totalStars: ownRepos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    ),
    totalForks: ownRepos.reduce(
      (sum, repo) => sum + repo.forks_count,
      0
    ),
    prCount: prResult.total_count,
    issueCount: issueResult.total_count,
    langColors
  }

  writeCache(data)

  return data
}

function getGitHubData(): Promise<GitHubData> {
  const cached = readCache()

  if (cached) {
    return Promise.resolve(cached)
  }

  if (githubRequest) {
    return githubRequest
  }

  githubRequest = requestGitHubData().finally(() => {
    githubRequest = null
  })

  return githubRequest
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GitHubSection() {
  const { t } = useTranslation()
  const ref = useReveal()

  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadGitHub = useCallback(async (force = false): Promise<void> => {
    setLoading(true)
    setError(false)

    if (force) {
      clearCache()
    }

    try {
      const githubData = await getGitHubData()

      setData(githubData)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(false)

      try {
        const githubData = await getGitHubData()

        if (active) {
          setData(githubData)
        }
      } catch {
        if (active) {
          setError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  return (
    <section id={'github'} className={'py-32'}>
      <div className={'max-w-6xl mx-auto px-6'}>
        <div ref={ref} className={'reveal'}>
          <SectionHeader label={t('github.label')} heading={t('github.heading')}/>

          {loading && (
            <div className={'flex justify-center py-20'}>
              <div className={'w-5 h-5 rounded-full border-2 border-subtle border-t-accent animate-spin'}/>
            </div>
          )}

          {error && (
            <div className={'flex items-center justify-between gap-4 font-mono text-accent border border-subtle p-4'}>
              <span>{t('github.error')}</span>

              <button
                type={'button'}
                onClick={() => { void loadGitHub(true) }}
                className={'btn-secondary shrink-0'}
              >
                {t('github.retry')}
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <div className={'grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3'}>

              {/* ── Left column: profile + stats ── */}
              <div className={'flex flex-col gap-3'}>

                {/* Profile card — grows to fill remaining height after stats */}
                <div className={'relative card p-6 flex flex-col gap-4 justify-between overflow-hidden flex-1'}>
                  <div className={'absolute inset-y-0 left-0 w-px bg-accent'}/>

                  <div className={'flex flex-col gap-4'}>
                    <div className={'flex items-center gap-3'}>
                      {data.user.avatar_url ?
                        (
                          <img
                            src={data.user.avatar_url}
                            alt={data.user.name ?? data.user.login}
                            className={'w-12 h-12 rounded-full border border-subtle shrink-0'}
                          />
                        ) :
                        (
                          <div className={'w-12 h-12 rounded-full flex items-center justify-center bg-accent-dim text-accent shrink-0'}>
                            <SiGithub size={22}/>
                          </div>
                        )}

                      <div>
                        <p className={'font-display font-bold text-lg text-foreground leading-tight'}>
                          {data.user.name ?? GITHUB_USERNAME}
                        </p>

                        <p className={'font-mono text-xs text-accent'}>
                          @{data.user.login}
                        </p>
                      </div>
                    </div>

                    {data.user.bio && (
                      <p className={'text-sm text-muted leading-relaxed'}>
                        {data.user.bio}
                      </p>
                    )}

                    <div className={'flex flex-col gap-1'}>
                      {data.user.followers && (
                        <div className={'flex items-center gap-1.5 font-mono text-xs text-muted'}>
                          <UserRoundGroupIcon size={10}/>
                          <span>{data.user.followers} {t('github.followers')}</span>
                        </div>
                      )}

                      {data.user.location && (
                        <div className={'flex items-center gap-1.5 font-mono text-xs text-muted'}>
                          <MapPin size={10}/>
                          <span>{data.user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <a
                    href={`https://github.com/${GITHUB_USERNAME}`}
                    target={'_blank'}
                    rel={'noreferrer'}
                    className={'self-start btn-secondary'}
                  >
                    <SiGithub size={12}/>
                    {t('github.viewProfile')}
                    <ExternalLinkIcon size={10}/>
                  </a>
                </div>

                {/* Stats — two rows of two */}
                <div className={'grid grid-cols-2 gap-3'}>
                  {[
                    {
                      label: t('github.stats.stars'),
                      value: data.totalStars.toLocaleString(),
                      icon: StarIcon
                    },
                    {
                      label: t('github.stats.forks'),
                      value: data.totalForks.toLocaleString(),
                      icon: GitForkIcon
                    },
                    {
                      label: t('github.stats.pullRequests'),
                      value: data.prCount.toLocaleString(),
                      icon: GitPullRequestIcon
                    },
                    {
                      label: t('github.stats.issues'),
                      value: data.issueCount.toLocaleString(),
                      icon: FileExclamationPointIcon
                    }
                  ].map((s) => (
                    <div key={s.label} className={'card p-4'}>
                      <p className={'font-display font-extrabold text-3xl text-accent leading-none tracking-[-0.02em]'}>
                        {s.value}
                      </p>

                      <div className={'flex items-center gap-1.5 text-muted font-mono text-xs mt-1.5 uppercase'}>
                        <s.icon size={10}/>
                        <span>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right column: repos ── */}
              <div className={'flex flex-col gap-3'}>
                {data.repos.map((repo, i) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target={'_blank'}
                    rel={'noreferrer'}
                    className={'group relative card p-5 hover:border-accent/35 hover:bg-accent-dim transition-all duration-200 no-underline flex items-start gap-4 overflow-hidden'}
                  >
                    {/* index number */}
                    <span className={'font-mono text-xs text-muted/40 group-hover:text-foreground transition-colors duration-200 w-4 shrink-0 mt-0.5 select-none'}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className={'flex-1 min-w-0'}>
                      <div className={'flex justify-between'}>
                        <span className={'font-mono text-sm font-medium text-accent'}>
                          {repo.name}
                        </span>
                        <ArrowUpRight
                          size={13}
                          className={'opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-1'}
                        />
                      </div>

                      <p className={'text-sm text-muted leading-[1.55]'}>
                        {repo.description ?? t('github.noDescription')}
                      </p>

                      <div className={'flex gap-4 mt-2'}>
                        {repo.language && (
                          <span className={'flex items-center gap-1 font-mono text-xs text-muted'}>
                            <span
                              className={'inline-block w-2 h-2 rounded-full shrink-0'}
                              style={{
                                background:
                                  data.langColors[repo.language]?.color ?? '#888'
                              }}
                            />

                            {repo.language}
                          </span>
                        )}

                        <span className={'flex items-center gap-1 font-mono text-xs text-muted'}>
                          <Star size={10}/>
                          {repo.stargazers_count}
                        </span>

                        <span className={'flex items-center gap-1 font-mono text-xs text-muted'}>
                          <GitFork size={10}/>
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
