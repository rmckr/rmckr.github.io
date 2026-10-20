import { useEffect, useState } from 'react'

/** True on viewports currently matching the media query. */
export function useWide(query: string) {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return wide
}
