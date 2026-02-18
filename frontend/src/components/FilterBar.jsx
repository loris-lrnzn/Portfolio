import { motion } from 'framer-motion'
import { useMemo } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'

const FilterBar = ({ technologies = [], selectedFilters = [], onFilterChange }) => {
  const prefersReducedMotion = useReducedMotion()

  // Get unique technologies sorted by count
  const uniqueTechs = useMemo(() => {
    const counts = {}
    const techs = Array.isArray(technologies) ? technologies : []
    techs.forEach(tech => {
      if (tech) {
        counts[tech] = (counts[tech] || 0) + 1
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Show top 8 technologies
      .map(([name]) => name)
  }, [technologies])

  const handleToggleFilter = (tech) => {
    if (selectedFilters.includes(tech)) {
      onFilterChange(selectedFilters.filter(t => t !== tech))
    } else {
      onFilterChange([...selectedFilters, tech])
    }
  }

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  if (uniqueTechs.length === 0) return null

  return (
    <motion.div
      {...getAnimationProps({
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      })}
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label="Filtrer par technologie"
    >
      {/* All button */}
      <motion.button
        onClick={() => onFilterChange([])}
        {...getAnimationProps({
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 }
        })}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${selectedFilters.length === 0
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }
        `}
      >
        Tous
      </motion.button>

      {/* Separator */}
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Technology pills */}
      {uniqueTechs.map((tech) => {
        const isSelected = selectedFilters.includes(tech)
        return (
          <motion.button
            key={tech}
            onClick={() => handleToggleFilter(tech)}
            {...getAnimationProps({
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 }
            })}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected
                ? 'bg-primary-blue text-white'
                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            {tech}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

export default FilterBar
