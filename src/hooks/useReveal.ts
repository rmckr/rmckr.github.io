import { useEffect, useRef } from 'react'

type RevealOptions = {
  /** Fraction of the element that must be visible before firing. */
  threshold?: number,
  /** Shrinks the viewport box, e.g. '0px 0px -30% 0px' fires only once the
      element's top has passed 70% of the screen — later than any edge peek. */
  rootMargin?: string
}

/**
 * Returns a ref to attach to a container element.
 * Once the element intersects the (adjusted) viewport, `data-visible` is set,
 * triggering the `reveal` utility's transition defined in index.css.
 * Fires once, then disconnects.
 */
export function useReveal(options: RevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const { threshold = 0.1, rootMargin } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = ''
          obs.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return ref
}
