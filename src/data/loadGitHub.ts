import { featuredRepos, GITHUB_USERNAME } from './index'
import type { GHRepo, GHUser } from './github'

// ── Types ─────────────────────────────────────────────────────────────────────

export type GitHubData = {
  user: GHUser
  repos: GHRepo[]
  totalStars: number
  totalForks: number
  prCount: number
  issueCount: number
}

type CachedGitHubData = {
  timestamp: number
  data: GitHubData
}

/** The slice of `Storage` the cache needs. */
type CacheStore = Pick<Storage, 'getItem' | 'setItem'>

// ── Cache ─────────────────────────────────────────────────────────────────────

const CACHE_KEY = `github-section:${GITHUB_USERNAME}:v2`
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Returns the raw cache entry, even an expired one — staleness is decided by
 * the loader, because an expired cache still beats an error box.
 * Missing or corrupt entries read as null.
 */
function readCache(store: CacheStore): CachedGitHubData | null {
  try {
    const raw = store.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedGitHubData) : null
  } catch {
    return null
  }
}

function isFresh(cached: CachedGitHubData): boolean {
  return Date.now() - cached.timestamp <= CACHE_TTL
}

function writeCache(store: CacheStore, data: GitHubData): void {
  try {
    store.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
  } catch {
    // Storage may be full or blocked; the data still renders, just uncached.
  }
}

/** Degrades to a no-op cache when `localStorage` is blocked (e.g. cookies disabled). */
const noStore: CacheStore = {
  getItem: () => null,
  setItem: () => undefined
}

function defaultStore(): CacheStore {
  try {
    return globalThis.localStorage
  } catch {
    return noStore
  }
}

// ── Fetching ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return (await response.json()) as T
}

async function requestGitHubData(): Promise<GitHubData> {
  const [user, allRepos, prResult, issueResult] = await Promise.all([
    fetchJson<GHUser>(`https://api.github.com/users/${GITHUB_USERNAME}`),

    fetchJson<GHRepo[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`),

    fetchJson<{ total_count: number }>(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:pr&per_page=1`
    ),

    fetchJson<{ total_count: number }>(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:issue&per_page=1`
    )
  ])

  const ownRepos = allRepos.filter((repo) => !repo.fork)

  // Hand-picked repos first, in curated order; the most-starred of the rest
  // fill in, so the flap row always renders featuredRepos.length panels even
  // if one of them is renamed or deleted.
  const featured = featuredRepos
    .map((pick) => ownRepos.find((repo) => repo.name === pick.name))
    .filter((repo): repo is GHRepo => repo !== undefined)

  const fill = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .filter((repo) => !featured.includes(repo))
    .slice(0, featuredRepos.length - featured.length)

  const repos = [...featured, ...fill]

  return {
    user,
    repos,
    totalStars: ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
    prCount: prResult.total_count,
    issueCount: issueResult.total_count
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

let inFlight: Promise<GitHubData> | null = null

/**
 * Cache-first load with a stale fallback: a fresh cache wins, otherwise
 * fetch; if the fetch fails, expired cache beats an error box. Concurrent
 * calls share one request. Pass `force` to skip the cache read (retry).
 */
export function loadGitHub(force = false): Promise<GitHubData> {
  if (inFlight) return inFlight

  inFlight = load(force).finally(() => {
    inFlight = null
  })
  return inFlight
}

async function load(force: boolean): Promise<GitHubData> {
  const store = defaultStore()
  const cached = readCache(store)

  if (cached && !force && isFresh(cached)) return cached.data

  try {
    const data = await requestGitHubData()
    writeCache(store, data)
    return data
  } catch (error) {
    if (cached) return cached.data
    throw error
  }
}
