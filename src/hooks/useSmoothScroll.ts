import { useEffect } from 'react'
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import 'lenis/dist/lenis.css'
import { sections } from '@/data/sections'

/**
 * Smooths the wheel and adds gentle scroll snapping between the page's
 * sections — every section in `sections.ts`, *not* the hero.
 *
 * Lenis runs on the real scroll position (it writes window.scrollTo each
 * frame), so everything already reading scroll keeps working untouched:
 * Motion's useScroll hero scrub, useRafScroll in the NavBar, the
 * IntersectionObserver reveals and useCountUp.
 *
 * Why the hero is excluded: its 200svh track is scrubbed by Hero.tsx, and a
 * snap point at the hero's own top (or anywhere inside it) would yank the user
 * out of the sequence. The first snap point is #about's top, which sits exactly
 * where the hero track ends — so once the hand-off dissolve is essentially
 * complete (within 20% of the viewport) the page settles onto it.
 *
 * The footer gets an 'end' snap point of its own: #contact is exactly one
 * viewport tall, so the document's very bottom ends up within the threshold of
 * contact's top — without it, proximity would yank the reader off the footer
 * and the page's end could never rest. With it, "scroll all the way down" is a
 * snap destination and the footer stays reachable.
 *
 * Snapping is proximity with a 20%-of-viewport threshold rather than
 * mandatory: the experience timeline and the github list grow taller than the
 * viewport, and mandatory would trap the reader at their top edge. Snap points
 * are element-backed and re-measured by lenis/snap when the body resizes, so
 * the GitHub section re-fetching taller content doesn't stale them.
 *
 * Reduced motion: Lenis self-gates (lerp 1 = 1:1 input, instant anchors), and
 * this effect skips Snap entirely so nobody gets an unannounced jump-to-section
 * instead of a scroll.
 *
 * Anchor links are left to the browser (Lenis's `anchors` option stays off):
 * #hero / #about / #contact clicks keep their native smooth scroll, history
 * entries and URL hash exactly as they were. The one exception is a link that
 * opts into a paced ride with `data-scroll-duration="<seconds>"` — the hero's
 * "view portfolio" button — which onSlowAnchorClick below takes over, because
 * the browser's native smooth scroll has no tunable duration.
 */

/** ease-in-out (cubic). Lenis's default ease-out-expo front-loads half the
 *  travel into the first tenth of the duration — fine for short jumps, but a
 *  two-viewport ride through the hero should breathe at both ends. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Capture-phase click handler for `<a data-scroll-duration="2.5" href="#id">`.
 * Takes the navigation over: preventDefault (which also cancels the native
 * history push — replicated below), then Lenis animates to the fragment over
 * the given duration, scrubbing the hero's sequence along the way. Like every
 * Lenis scroll it stays interruptible (a wheel gesture takes over mid-flight),
 * and under reduced motion it jumps instantly — the same thing the native
 * navigation would have done there.
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

    const snap = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
      ? new Snap(lenis, {
          type: 'proximity',
          distanceThreshold: '25%'
        })
      : null

    if (snap) {
      // const targets = sections
      //   .map((item) => document.getElementById(item.id))
      //   .filter((el): el is HTMLElement => el !== null)
      const target = document.getElementById(sections[0].id)
      if (target) snap.addElement(target)

      // const footer = document.querySelector('footer')
      // if (footer) snap.addElement(footer, { align: 'end' })
    }

    // Registered for everyone: under reduced motion Lenis jumps instantly, so
    // paced links degrade to the same instant navigation as the native one.
    const onSlowClick = (event: MouseEvent) => onSlowAnchorClick(event, lenis)
    document.addEventListener('click', onSlowClick, true)

    return () => {
      document.removeEventListener('click', onSlowClick, true)
      snap?.destroy()
      lenis.destroy()
    }
  }, [])
}
