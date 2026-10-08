import { useCallback, useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { LuExternalLink, LuFileWarning, LuGitFork, LuGitPullRequest, LuMapPin, LuStar, LuUsersRound } from 'react-icons/lu'
import { GITHUB_USERNAME } from '../data'
import type { GHRepo, GHUser } from '../data/github'
import { useTranslation } from '../i18n/i18n'
import { Counter } from './Counter'
import { Section } from './Section'
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

// ── Stat card ──────────────────────────────────────────────────────────────────
// Uses the same card surface and hover treatment as the repository cards.

type StatCardProps = {
  label: string,
  value: number,
  icon: IconType
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className={'card p-4'}>
      <p className={'font-display text-3xl leading-none font-extrabold tracking-display text-accent'}>
        <Counter value={value}/>
      </p>

      <div className={'mt-1.5 flex items-center gap-1.5 meta label'}>
        <Icon/>
        <span>{label}</span>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GitHubSection() {
  const { t } = useTranslation()

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
    <Section id={'github'}>
      <SectionHeader label={t('github.label')} heading={t('github.heading')}/>

      {loading && (
        <div className={'flex justify-center py-20'}>
          <div className={'size-5 animate-spin rounded-full border-2 border-subtle border-t-accent'}/>
        </div>
      )}

      {error && (
        <div className={'flex items-center justify-between gap-4 card p-4 font-mono text-accent'}>
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
        <div className={'grid stagger grid-cols-1 gap-3 lg:grid-cols-[1fr_2fr]'}>

          {/* ── Left column: profile + stats ── */}
          <div className={'flex flex-col gap-3'}>

            {/* Profile card — grows to fill remaining height after stats */}
            <div className={'relative flex flex-1 flex-col justify-between gap-4 overflow-hidden card p-6'}>
              <div className={'absolute inset-y-0 left-0 w-px bg-accent'}/>

              <div className={'flex flex-col gap-4'}>
                <div className={'flex items-center gap-3'}>
                  {data.user.avatar_url ?
                    (
                      <img
                        src={data.user.avatar_url}
                        alt={data.user.name ?? data.user.login}
                        className={'size-12 shrink-0 rounded-full border border-subtle'}
                      />
                    ) :
                    (
                      <div className={'flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent'}>
                        <FaGithub size={22}/>
                      </div>
                    )}

                  <div>
                    <p className={'font-display text-lg/tight font-extrabold text-foreground'}>
                      {data.user.name ?? GITHUB_USERNAME}
                    </p>

                    <p className={'font-mono text-xs text-accent'}>
                      @{data.user.login}
                    </p>
                  </div>
                </div>

                {data.user.bio && (
                  <p className={'text-sm/relaxed text-muted'}>
                    {data.user.bio}
                  </p>
                )}

                <div className={'flex flex-col gap-1'}>
                  {data.user.followers && (
                    <div className={'flex items-center gap-1.5 meta'}>
                      <LuUsersRound/>
                      <span>
                        <Counter value={data.user.followers}/>
                        {' '}
                        {t('github.followers')}
                      </span>
                    </div>
                  )}

                  {data.user.location && (
                    <div className={'flex items-center gap-1.5 meta'}>
                      <LuMapPin/>
                      <span>{data.user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target={'_blank'}
                rel={'noreferrer'}
                className={'btn-secondary self-start'}
              >
                <FaGithub size={14}/>
                {t('github.viewProfile')}
                <LuExternalLink/>
              </a>
            </div>

            {/* Stats — two rows of two */}
            <div className={'grid stagger grid-cols-2 gap-3'}>
              <StatCard label={t('github.stats.stars')} value={data.totalStars} icon={LuStar}/>
              <StatCard label={t('github.stats.forks')} value={data.totalForks} icon={LuGitFork}/>
              <StatCard label={t('github.stats.pullRequests')} value={data.prCount} icon={LuGitPullRequest}/>
              <StatCard label={t('github.stats.issues')} value={data.issueCount} icon={LuFileWarning}/>
            </div>
          </div>

          {/* ── Right column: repos ── */}
          <div className={'flex stagger flex-col gap-3'}>
            {data.repos.map((repo, i) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target={'_blank'}
                rel={'noreferrer'}
                className={'group relative flex items-start gap-4 overflow-hidden card p-5 transition-all duration-200 hover:border-accent/35 hover:bg-accent-dim'}
              >
                {/* index number */}
                <span className={'mt-0.5 w-4 shrink-0 font-mono text-xs text-muted/40 transition-colors duration-200 select-none group-hover:text-foreground'}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className={'min-w-0 flex-1'}>
                  <div className={'flex justify-between'}>
                    <span className={'font-mono text-sm font-medium text-accent'}>
                      {repo.name}
                    </span>
                    <LuExternalLink
                      size={12}
                      className={'mt-1 icon-nudge opacity-30 group-hover:opacity-100'}
                    />
                  </div>

                  <p className={'text-sm/relaxed text-muted'}>
                    {repo.description ?? t('github.noDescription')}
                  </p>

                  <div className={'mt-2 flex gap-4'}>
                    {repo.language && (
                      <span className={'flex items-center gap-1 meta'}>
                        <span
                          className={'inline-block size-2 shrink-0 rounded-full'}
                          style={{
                            background:
                              data.langColors[repo.language]?.color ?? '#888'
                          }}
                        />

                        {repo.language}
                      </span>
                    )}

                    <span className={'flex items-center gap-1 meta'}>
                      <LuStar/>
                      {repo.stargazers_count}
                    </span>

                    <span className={'flex items-center gap-1 meta'}>
                      <LuGitFork/>
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
