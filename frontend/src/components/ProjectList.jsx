import { motion } from 'framer-motion'
import ProjectRow from './ProjectRow'
import useReducedMotion from '../hooks/useReducedMotion'

const ProjectList = ({ projects, loading, error }) => {
  const prefersReducedMotion = useReducedMotion()

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  if (loading) {
    return (
      <div className="w-full py-32 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0 },
              animate: { opacity: 1 }
            })}
            className="text-center"
          >
            <div
              className="inline-block w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mb-4"
              role="status"
              aria-label="Chargement"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">
              Chargement des projets...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-32 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            })}
            className="text-center"
            role="alert"
          >
            <p className="text-sm text-red-500 dark:text-red-400 mb-2 font-light">{error}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
              Assurez-vous que le backend Symfony est démarré
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-32 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0 },
              animate: { opacity: 1 }
            })}
            className="text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-2">
              Aucun projet trouvé
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-dark-bg">
      <div
        role="list"
        aria-label="Liste des projets"
      >
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}
      </div>

      {/* Results Count */}
      <motion.div
        {...getAnimationProps({
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true }
        })}
        className="w-full py-8"
      >
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase text-center">
            {projects.length} projet{projects.length > 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ProjectList
