import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, [prefersReducedMotion])

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 20 },
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 }
      }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          {...animationProps}
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full glass-strong shadow-lg flex items-center justify-center text-gray-900 dark:text-gray-100 hover:shadow-xl transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg"
          aria-label="Retourner en haut de la page"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
