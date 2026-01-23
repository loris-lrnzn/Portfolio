import { motion } from 'framer-motion'
import ProjectRow from './ProjectRow'

const ProjectList = ({ projects, loading, error }) => {

  if (loading) {
    return (
      <div className="w-full py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-light tracking-wide">
              Chargement des projets...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-red-500 mb-2 font-light">{error}</p>
            <p className="text-xs text-gray-400 font-light">
              Assurez-vous que le backend Symfony est démarré
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 font-light mb-2">
              Aucun projet trouvé
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05,
            }
          }
        }}
        className="w-full"
      >
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}
      </motion.div>

      {/* Results Count - Subtle footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full py-12 border-b border-gray-100"
      >
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <p className="text-xs text-gray-400 font-light tracking-widest uppercase text-center">
            {projects.length} projet{projects.length > 1 ? 's' : ''} trouvé{projects.length > 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ProjectList
