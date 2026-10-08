import { useEffect, useRef } from 'react'

type TickCallback = (scrollY: number) => void

/**
 * Calls `onTick` whenever the window scrolls, throttled to at most one call
 * per frame via requestAnimationFrame. Pass `withResize` to re-run on resize
 * as well (useful when the tick measures layout).
 *
 * The first tick is scheduled a frame after mount instead of running inside
 * the effect itself, and the latest callback is kept in a ref, so callers
 * don't need to memoize it.
 */
export function useRafScroll(onTick: TickCallback, withResize = false) {
  const latestRef = useRef(onTick)

  useEffect(() => {
    latestRef.current = onTick
  })

  useEffect(() => {
    let frame = 0

    const tick = () => {
      frame = 0
      latestRef.current(window.scrollY)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    if (withResize) window.addEventListener('resize', schedule, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [withResize])
}
