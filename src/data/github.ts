/** Only the fields the section reads: the avatar and bio of the account. */
export type GHUser = {
  bio: string | null
  avatar_url: string
}

/** The repository list is only summed, so the totals are all it is typed for. */
export type GHRepo = {
  stargazers_count: number
  forks_count: number
  fork: boolean
}
