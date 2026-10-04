import { useEffect, useRef } from 'react'

/**
 * Returns a ref to attach to a container element.
 * Once the element intersects the viewport, `data-visible` is set,
 * triggering the `reveal` utility's transition defined in index.css.
 */
export function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

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
      { threshold: 0.1 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return ref
}
