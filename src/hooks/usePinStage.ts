import { useScroll } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'

/** The stage's `top-32` pin line in px — pairs with the stage's Tailwind
    `top-32` class and the measured offsets below (change them together). */
export const PIN_PX = 128

/** SvH of runway scroll per pinned item — the scrub's speed. */
const SVH_PER_ITEM = 40

/**
 * A sticky stage inside a scroll runway, with scroll progress phase-matched
 * to the pin: 0 the moment the stage's top hits PIN_PX, 1 exactly where
 * native sticky releases (runway bottom reaches PIN_PX + stage height).
 * Both edges are measured from the stage's own height, so there is no
 * frozen head before p starts or tail after it ends, and the stage keeps
 * its natural content height — no viewport-filling box. `enabled` turns
 * measuring off (reduced motion / narrow screens); stageH then stays 0 and
 * the fallback offsets and runway height cover the pre-measurement frame.
 */
export function usePinStage(enabled: boolean) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stageH, setStageH] = useState(0)

  useLayoutEffect(() => {
    if (!enabled) return
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      // Skip identical re-measures so the ResizeObserver can't loop React.
      setStageH((prev) => {
        const h = Math.round(stage.getBoundingClientRect().height)
        return prev === h ? prev : h
      })
    }
    // Initial observation lands before the first paint, so offsets are
    // correct from the opening frame.
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [enabled])

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset:
      stageH > 0
        ? [`start ${PIN_PX}px`, `end ${PIN_PX + stageH}px`]
        : ['start start', 'end end']
  })

  // The measured stage plus SVH_PER_ITEM of scrub per item, so the scrub
  // spans exactly SVH_PER_ITEM per item from pin to release. Inline value,
  // not a class: Tailwind can't build dynamic values at runtime.
  const runwayHeight = (items: number) =>
    stageH > 0
      ? `calc(${stageH}px + ${SVH_PER_ITEM * items}svh)`
      : `${100 + SVH_PER_ITEM * items}svh`

  return { runwayRef, stageRef, stageH, scrollYProgress, runwayHeight }
}
