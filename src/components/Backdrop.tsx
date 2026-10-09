import { useEffect, useRef } from 'react'

/**
 * Fixed layer behind the page. All motion is CSS-driven (see the `ambient-*`
 * utilities in index.css): the perspective floor fills the whole viewport —
 * its vanishing point is hidden under the top fade, so there is no hard
 * horizon line — plus a breathing glow and a vignette. Solid sections cover
 * everything except the hero and the contact section.
 *
 * The only JS part is the floor's parallax offset, written at most once per
 * frame. Reduced-motion and touch devices get a completely static backdrop.
 */
export function Backdrop() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!motionOk || !finePointer) return

    let frame = 0
    let x = window.innerWidth * 0.5
    let y = window.innerHeight * 0.42

    const paint = () => {
      frame = 0

      const root = rootRef.current
      if (!root) return

      const nx = x / window.innerWidth - 0.5 // -0.5 … 0.5
      const ny = y / window.innerHeight - 0.5

      root.style.setProperty('--bx', `${(nx * 18).toFixed(2)}px`)
      root.style.setProperty('--by', `${(ny * 12).toFixed(2)}px`)
    }

    const onPointerMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={rootRef} className={'ambient'} aria-hidden={'true'}>
      <div className={'ambient-glow'} />
      <div className={'ambient-floor'}>
        <div className={'ambient-plane'} />
      </div>
      <div className={'ambient-vignette'} />
    </div>
  )
}
