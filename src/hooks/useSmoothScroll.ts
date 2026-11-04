import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Smooths the wheel for the whole page.
 *
 * Lenis runs on the real scroll position (it writes window.scrollTo each
 * frame), so everything already reading scroll keeps working untouched: the
 * Motion scroll links, the IntersectionObserver reveals, useRafScroll.
 *
 * No snapping: the page is driven by scroll-linked drawing, and a snap that
 * pulls the document a quarter of a screen would show up in that drawing.
 *
 * Reduced motion: Lenis self-gates (lerp 1 = 1:1 input, instant anchors).
 *
 * Anchor links are left to the browser (Lenis's `anchors` option stays off):
 * clicks keep their native smooth scroll, history entries and URL hash. The
 * one exception is a link that opts into a paced ride with
 * `data-scroll-duration="<seconds>"`, which onSlowAnchorClick below takes
 * over, because the browser's native smooth scroll has no tunable duration.
 */

/** ease-in-out (cubic). Lenis's default ease-out-expo front-loads half the
 *  travel into the first tenth of the duration — fine for short jumps, but a
 *  long ride should breathe at both ends. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Height of the fixed header: a paced jump should land under it, not beneath it. */
const HEADER_OFFSET = -64

/**
 * Capture-phase click handler for `<a data-scroll-duration="2.5" href="#id">`.
 * Takes the navigation over: preventDefault (which also cancels the native
 * history push — replicated below), then Lenis animates to the fragment over
 * the given duration. Like every Lenis scroll it stays interruptible (a wheel
 * gesture takes over mid-flight), and under reduced motion it jumps instantly —
 * the same thing the native navigation would have done there.
 */
function onSlowAnchorClick(event: MouseEvent, lenis: Lenis) {
  // Plain left clicks only: modified clicks keep their native meaning
  // (cmd/ctrl "open in new tab", shift "new window", middle click).
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest<HTMLAnchorElement>('a[data-scroll-duration]')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href || href.length < 2 || !href.startsWith('#')) return

  const duration = Number.parseFloat(link.dataset.scrollDuration ?? '')
  if (!Number.isFinite(duration) || duration <= 0) return // malformed: keep native navigation

  event.preventDefault()
  history.pushState(null, '', href)
  lenis.scrollTo(href, { duration, easing: easeInOutCubic, offset: HEADER_OFFSET })
}

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true })

    // Registered for everyone: under reduced motion Lenis jumps instantly, so
    // paced links degrade to the same instant navigation as the native one.
    const onSlowClick = (event: MouseEvent) => onSlowAnchorClick(event, lenis)
    document.addEventListener('click', onSlowClick, true)

    return () => {
      document.removeEventListener('click', onSlowClick, true)
      lenis.destroy()
    }
  }, [])
}
