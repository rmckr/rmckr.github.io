export type GHUser = {
  name: string,
  login: string,
  bio: string | null,
  avatar_url: string,
  public_repos: number,
  followers: number,
  following: number,
  location: string | null,
  blog: string | null
}

export type GHRepo = {
  id: number,
  name: string,
  description: string | null,
  stargazers_count: number,
  forks_count: number,
  language: string | null,
  html_url: string,
  topics: string[],
  fork: boolean
}
