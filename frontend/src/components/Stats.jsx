import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const Counter = ({ value, suffix = '', duration = 2, prefersReducedMotion }) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        // Skip animation, show final value immediately
        count.set(value)
      } else {
        const animation = animate(count, value, {
          duration,
          ease: [0.16, 1, 0.3, 1]
        })
        return animation.stop
      }
    }
  }, [isInView, count, value, duration, prefersReducedMotion])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

const Stats = () => {
  const prefersReducedMotion = useReducedMotion()

  const stats = [
    { value: 3, suffix: '+', label: "Années d'expérience", duration: 1.5 },
    { value: 15, suffix: '+', label: 'Projets réalisés', duration: 2 },
    { value: 20, suffix: '+', label: 'Technologies maîtrisées', duration: 2.5 },
    { value: 1000, suffix: '+', label: 'Tasses de café', emoji: '☕', duration: 3 }
  ]

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <section
      className="py-20 md:py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-dark-bg dark:to-gray-900/50"
      aria-labelledby="stats-title"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.8 }
          })}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            {...getAnimationProps({
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.2 }
            })}
            className="text-xs text-gray-400 dark:text-gray-500 font-light tracking-[0.3em] uppercase mb-4 block"
          >
            Quelques chiffres
          </motion.span>
          <h2 id="stats-title" className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tighter text-gray-900 dark:text-gray-100">
            En quelques{' '}
            <span className="bg-gradient-to-r from-primary-blue to-primary-cyan bg-clip-text text-transparent">
              nombres
            </span>
          </h2>
        </motion.div>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" role="list" aria-label="Statistiques">
          {stats.map((stat, index) => (
            <motion.li
              key={stat.label}
              {...getAnimationProps({
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-50px' },
                transition: { duration: 0.6, delay: index * 0.1 }
              })}
              className="glass-card rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-shadow duration-300"
              role="listitem"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-2 md:mb-3">
                <span className="bg-gradient-to-r from-primary-blue to-primary-cyan bg-clip-text text-transparent">
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={stat.duration}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-light">
                {stat.label}
                {stat.emoji && (
                  <span aria-hidden="true" className="ml-1">
                    {stat.emoji}
                  </span>
                )}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Stats
