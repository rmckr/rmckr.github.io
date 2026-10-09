import { useCountUp } from '../hooks/useCountUp'

type CounterProps = {
  /** Final value, counted up from 0 once scrolled into view */
  value: number
  /** Display formatter, defaults to the locale-aware number (e.g. 1,234) */
  format?: (n: number) => string
  className?: string
}

export function Counter({ value, format = (n) => n.toLocaleString(), className }: CounterProps) {
  const { ref, value: current } = useCountUp(value)

  return (
    <span ref={ref} className={className}>
      {format(current)}
    </span>
  )
}
