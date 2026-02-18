import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import useReducedMotion from '../hooks/useReducedMotion'

const ProjectRow = ({ project, index }) => {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = useCallback(() => {
    navigate(`/project/${project.id}`)
  }, [navigate, project.id])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  const projectNumber = String(index + 1).padStart(2, '0')

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <motion.article
      {...getAnimationProps({
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: {
          duration: 0.6,
          delay: index * 0.05,
          ease: [0.16, 1, 0.3, 1]
        }
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group relative cursor-pointer border-b border-gray-100 dark:border-gray-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-blue outline-none"
      role="link"
      tabIndex={0}
      aria-label={`Voir le projet ${project.title}`}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-6xl py-6 md:py-8">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          {/* Left: Thumbnail + Number + Title */}
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            {/* Thumbnail */}
            <motion.div
              className="relative w-16 h-12 md:w-24 md:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
              {...getAnimationProps({
                animate: { scale: isHovered ? 1.05 : 1 }
              })}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-300 dark:text-gray-600">
                    {projectNumber}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Number + Year */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-widest tabular-nums">
                {projectNumber}
              </span>
              {project.year && (
                <>
                  <span className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums">
                    {project.year}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <motion.h3
              className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight leading-tight truncate"
              {...getAnimationProps({
                animate: { x: isHovered ? 4 : 0 }
              })}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <span className={
                isHovered && !prefersReducedMotion
                  ? 'bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent'
                  : 'text-gray-900 dark:text-gray-100'
              }>
                {project.title}
              </span>
            </motion.h3>
          </div>

          {/* Right: Tags + Arrow */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Tags - Desktop only */}
            <div className="hidden md:flex items-center gap-3">
              {project.technology_tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                  {...getAnimationProps({
                    animate: {
                      color: isHovered ? '#2563EB' : undefined,
                      opacity: isHovered ? 1 : 0.7
                    }
                  })}
                  transition={{ duration: 0.2, delay: tagIndex * 0.03 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Arrow */}
            <motion.div
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center"
              {...getAnimationProps({
                animate: {
                  scale: isHovered ? 1.1 : 1,
                  borderColor: isHovered ? '#2563EB' : undefined,
                  backgroundColor: isHovered ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                }
              })}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                {...getAnimationProps({
                  animate: { rotate: isHovered ? 45 : 0 }
                })}
                transition={{ duration: 0.2 }}
              >
                <ArrowUpRight
                  size={18}
                  className={isHovered ? 'text-primary-blue' : 'text-gray-400 dark:text-gray-500'}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

      </div>
    </motion.article>
  )
}

export default ProjectRow
