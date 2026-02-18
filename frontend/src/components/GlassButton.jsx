import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import useReducedMotion from '../hooks/useReducedMotion'

const GlassButton = ({ children, href, onClick, variant = 'primary', className = '' }) => {
  const prefersReducedMotion = useReducedMotion()

  const baseClasses = 'px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg'

  const variants = {
    primary: 'real-glass text-gray-900 dark:text-gray-100 hover:shadow-xl hover:scale-[1.02]',
    secondary: 'glass text-gray-900 dark:text-gray-100 hover:glass-strong'
  }

  const motionProps = prefersReducedMotion
    ? {}
    : { whileTap: { scale: 0.98 }, transition: { type: 'tween', duration: 0.15, ease: 'easeOut' } }

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight
        className={prefersReducedMotion ? '' : 'group-hover:translate-x-1 transition-transform'}
        size={20}
        aria-hidden="true"
      />
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        {...motionProps}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      {...motionProps}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {content}
    </motion.button>
  )
}

export default GlassButton
