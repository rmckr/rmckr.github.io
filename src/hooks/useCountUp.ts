import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 up to `target` once the element scrolls into view.
 * Returns a callback ref (attachable to any element) and the current value.
 * Reduced-motion users get the final value immediately.
 */
export function useCountUp(target: number, duration = 1300) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  const [value, setValue] = useState(0)
  const frameRef = useRef(0)

  const ref = useCallback((node: HTMLElement | null) => setEl(node), [])

  useEffect(() => {
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()

        if (reduced) {
          setValue(target)
          return
        }

        const start = performance.now()

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress)
          setValue(Math.round(target * eased))

          if (progress < 1) frameRef.current = requestAnimationFrame(tick)
        }

        frameRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )

    obs.observe(el)

    return () => {
      obs.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [el, target, duration])

  return { ref, value }
}
