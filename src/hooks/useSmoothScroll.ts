import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Smooths the wheel for the whole page.
 *
 * Lenis runs on the real scroll position (it writes window.scrollTo each
 * frame), so everything already reading scroll keeps working untouched: the
 * card's flight, the ring's angle and the year's dial.
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
 *
 * Programmatic jumps (the project index) go through `scrollToY`, so they ride
 * the same scroller as the wheel instead of handing the reader to the browser's
 * own smooth scroll for one hop.
 */

/** ease-in-out (cubic). Lenis's default ease-out-expo front-loads half the
 *  travel into the first tenth of the duration — fine for short jumps, but a
 *  long ride should breathe at both ends. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** The page's scroller, published for `scrollToY`: the wheel and a programmatic
 *  jump then share one ride. Null before the hook mounts and after it unmounts. */
let scroller: Lenis | null = null

/** A jump's ride, in seconds. Distance scales it, so a one-face hop is not given
 *  a whole section's worth of travel and a long one still breathes at both ends. */
const JUMP_MIN = 0.8
const JUMP_MAX = 1.2
const JUMP_SPAN = 1280

/**
 * Moves the page to `top` — clamped by the caller — through the page's scroller.
 * Before Lenis is up (or after it is torn down) this falls back to the browser's
 * smooth scroll, so a jump still lands.
 */
export function scrollToY(top: number) {
  const travel = Math.abs(top - window.scrollY)
  if (travel < 1) return

  if (!scroller) {
    window.scrollTo({ top, behavior: 'smooth' })
    return
  }

  const duration = JUMP_MIN + (JUMP_MAX - JUMP_MIN) * Math.min(travel / JUMP_SPAN, 1)
  scroller.scrollTo(top, { duration, easing: easeInOutCubic })
}

/**
 * Capture-phase click handler for `<a data-scroll-duration="2.5" href="#id">`.
 * Takes the navigation over: preventDefault (which also cancels the native
 * history push — replicated below), then Lenis animates to the fragment over
 * the given duration. Like every Lenis scroll it stays interruptible (a wheel
 * gesture takes over mid-flight), and under reduced motion it jumps instantly —
 * the same thing the native navigation would have done there.
 *
 * The landing is the fragment's own top. No inset is set here and the page
 * carries no `scroll-padding-top`, so a paced ride, a plain anchor and a focus
 * scroll all stop on the same pixel — the section's first line.
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
  lenis.scrollTo(href, { duration, easing: easeInOutCubic })
}

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true })
    scroller = lenis

    // Registered for everyone: under reduced motion Lenis jumps instantly, so
    // paced links degrade to the same instant navigation as the native one.
    const onSlowClick = (event: MouseEvent) => onSlowAnchorClick(event, lenis)
    document.addEventListener('click', onSlowClick, true)

    return () => {
      document.removeEventListener('click', onSlowClick, true)
      scroller = null
      lenis.destroy()
    }
  }, [])
}
