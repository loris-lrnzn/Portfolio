import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import useReducedMotion from '../hooks/useReducedMotion'

const ThemeToggle = ({ darkHero = false }) => {
  const { theme, toggleTheme } = useTheme()
  const prefersReducedMotion = useReducedMotion()

  const iconAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { rotate: theme === 'light' ? -90 : 90, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: theme === 'light' ? 90 : -90, opacity: 0 },
        transition: { duration: 0.2 }
      }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg ${
        darkHero
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'glass-light text-gray-700 dark:text-gray-300 hover:glass'
      }`}
      aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      aria-pressed={theme === 'dark'}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="moon"
            {...iconAnimationProps}
          >
            <Moon size={18} aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            {...iconAnimationProps}
          >
            <Sun size={18} aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default ThemeToggle
