import { motion, useScroll, useSpring } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const ScrollProgress = () => {
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const springConfig = prefersReducedMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 100, damping: 30, restDelta: 0.001 }

  const scaleX = useSpring(scrollYProgress, springConfig)

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue origin-left z-[100]"
      style={{ scaleX }}
      role="progressbar"
      aria-label="Progression de lecture de la page"
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}

export default ScrollProgress
