import { useCallback, useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { LuExternalLink, LuFileWarning, LuGitFork, LuGitPullRequest, LuMapPin, LuStar, LuUsersRound } from 'react-icons/lu'
import { GITHUB_USERNAME } from '../data'
import { loadGitHub, type GitHubData } from '../data/loadGitHub'
import { useTranslation } from '../i18n/i18n'
import { Counter } from './Counter'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

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

// ── Component ──────────────────────────────────────────────────────────────────

export function GitHubSection() {
  const { t } = useTranslation()

  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const request = useCallback((force = false) => loadGitHub(force), [])

  const apply = useCallback((result: GitHubData): void => {
    setData(result)
    setLoading(false)
  }, [])

  const fail = useCallback((): void => {
    setError(true)
    setLoading(false)
  }, [])

  // The rule allows setState in promise callbacks, not in the effect body itself.
  useEffect(() => {
    request().then(apply, fail)
  }, [request, apply, fail])

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
            onClick={() => {
              setLoading(true)
              setError(false)
              request(true).then(apply, fail)
            }}
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
                  <img
                    src={data.user.avatar_url}
                    alt={data.user.name ?? data.user.login}
                    className={'size-12 shrink-0 rounded-full border border-subtle'}
                  />

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
                  {data.user.followers > 0 && (
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
