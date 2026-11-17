import { useEffect, type CSSProperties, type RefObject } from 'react'

/**
 * The holo card's foil: white light on the deep `accent` face. A lamp above the
 * card and right of centre, a broader wash corner to corner, a soft specular
 * streak and a faint dot grid, all blending `screen` straight onto the face, so
 * the card's own red supplies the hue and the sheen runs from it to a pale
 * highlight. Nothing is laid on as an opaque film, so whatever sits under the
 * foil — the face's surface, or the project's cover — takes the same light.
 * Angle and lamp are the face's own signature: two cards never light the same
 * way.
 */
export function HoloFoil({ angle, lamp }: { angle: number; lamp: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      style={
        {
          '--holo': 'calc(0.40 * var(--foil, 1))',
          '--dots': 'calc(0.06 * var(--foil, 1))'
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-(--holo) mix-blend-screen"
        style={{
          background: `radial-gradient(120% 100% at calc(${lamp}% - var(--ratio-x, 0) * 18% - var(--sway, 0) * 6%) calc(-12% - var(--ratio-y, 0) * 12%), rgb(255 255 255 / 0.45), rgb(255 255 255 / 0.32) 20%, rgb(255 255 255 / 0.17) 46%, rgb(255 255 255 / 0.08) 72%, rgb(255 255 255 / 0.04)), linear-gradient(${angle}deg, rgb(255 255 255 / 0.02) calc(0% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), rgb(255 255 255 / 0.09) calc(26% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), rgb(255 255 255 / 0.3) calc(44% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), rgb(255 255 255 / 0.1) calc(66% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), rgb(255 255 255 / 0.03) calc(100% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%))`
        }}
      />
      <div
        className="absolute inset-0 opacity-(--holo) mix-blend-screen"
        style={{
          background: `linear-gradient(${angle}deg, transparent calc(30% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), rgb(255 255 255 / 0.13) calc(46% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%), transparent calc(62% - var(--ratio-x, 0) * 20% - var(--sway, 0) * 8%))`
        }}
      />
      <div
        className="absolute inset-0 opacity-(--dots) mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 0.1rem, transparent 0.1rem)',
          backgroundSize: '1rem 1rem'
        }}
      />
    </div>
  )
}

/**
 * Pointer ratios: -1 at an edge, 0 at the centre. A frame loop chases them
 * toward the pointer by 16% per 60 Hz frame — a rate, not a per-frame step —
 * and stops once settled, so entering and leaving ease instead of snapping.
 * Decorative, so touch and reduced motion never set them and the card keeps
 * its rest pose.
 */
export function usePointerRatio(frameRef: RefObject<HTMLDivElement | null>, enabled = true) {
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !enabled) return

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0
    // The last frame's timestamp, so the chase is measured in time, not frames.
    // Reset whenever the loop restarts from idle.
    let last = 0

    const draw = (time: number) => {
      // 16% of the remaining distance per 60 Hz frame, expressed as a rate:
      // a 120 Hz display takes half the step twice as often and settles at the
      // same wall-clock speed; a stalled tab settles instead of jumping.
      const dt = last === 0 ? 1000 / 60 : Math.min(64, time - last)
      last = time
      const k = 1 - Math.pow(1 - 0.16, dt / (1000 / 60))

      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k

      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002

      if (settled) {
        current.x = target.x
        current.y = target.y
      }

      frame.style.setProperty('--ratio-x', current.x.toFixed(3))
      frame.style.setProperty('--ratio-y', current.y.toFixed(3))
      raf = settled ? 0 : window.requestAnimationFrame(draw)
    }

    const chase = () => {
      if (raf !== 0) return
      last = 0
      raf = window.requestAnimationFrame(draw)
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      const box = frame.getBoundingClientRect()
      const x = (event.clientX - box.left - box.width / 2) / (box.width / 2)
      const y = (event.clientY - box.top - box.height / 2) / (box.height / 2)
      target.x = Math.max(-1, Math.min(1, x))
      target.y = Math.max(-1, Math.min(1, y))
      chase()
    }

    const leave = () => {
      target.x = 0
      target.y = 0
      chase()
    }

    frame.addEventListener('pointermove', move)
    frame.addEventListener('pointerleave', leave)

    return () => {
      frame.removeEventListener('pointermove', move)
      frame.removeEventListener('pointerleave', leave)
      if (raf !== 0) window.cancelAnimationFrame(raf)
    }
  }, [frameRef, enabled])
}
