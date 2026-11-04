import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds to wait before the block settles. */
  delay?: number
}

/**
 * The one content entrance: a block settles up 18px as it enters. Transform
 * animation is the only motion; MotionConfig turns it off for visitors who ask
 * for reduced motion.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}
