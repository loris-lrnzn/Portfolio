import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import axios from 'axios'
import Header from '../components/Header'
import CustomCursor from '../components/CustomCursor'
import ScrollProgress from '../components/ScrollProgress'
import GlassButton from '../components/GlassButton'
import Footer from '../components/Footer'

const API_URL = '/api'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      // Essayer d'abord l'endpoint dédié, sinon fallback sur la liste
      try {
        const response = await axios.get(`${API_URL}/projects/${id}`)
        setProject(response.data)
        setError(null)
      } catch (err) {
        // Fallback: récupérer tous les projets et filtrer
        const response = await axios.get(`${API_URL}/projects`)
        const foundProject = response.data.find(p => p.id === parseInt(id))
        
        if (foundProject) {
          setProject(foundProject)
          setError(null)
        } else {
          setError('Projet non trouvé')
        }
      }
    } catch (err) {
      setError('Erreur de chargement du projet')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <CustomCursor />
        <ScrollProgress />
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-light">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white relative">
        <CustomCursor />
        <ScrollProgress />
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">{error || 'Projet non trouvé'}</p>
            <GlassButton onClick={() => navigate('/')} variant="primary">
              Retour à l'accueil
            </GlassButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <CustomCursor />
      <ScrollProgress />
      <Header />

      {/* Hero Image Section - Full Width */}
      {project.image_url && (
        <motion.div
          className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
          
          {/* Back Button - Floating */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center hover:scale-[1.02] transition-transform duration-200"
          >
            <ArrowLeft className="text-gray-900" size={20} />
          </motion.button>
        </motion.div>
      )}

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-6 md:px-8 lg:px-12 max-w-6xl py-16 md:py-24"
      >
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-light tracking-wide mb-8 transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            <span>Retour aux projets</span>
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-[0.9] mb-6"
          >
            <span className="text-gray-900">{project.title}</span>
          </motion.h1>

          {/* Technology Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            {project.technology_tags.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="px-4 py-2 rounded-full glass-light text-xs font-light tracking-[0.2em] uppercase text-gray-700"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4"
          >
            {project.github_link && (
              <motion.a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass-strong text-sm font-medium text-gray-900 hover:text-[#2563EB] transition-colors duration-200"
              >
                <Github size={18} />
                <span>Code Source</span>
                <ExternalLink size={14} />
              </motion.a>
            )}
          </motion.div>
        </div>

        {/* Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-16 md:mb-24"
        >
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-6 tracking-tight">
              À propos du projet
            </h2>
            <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed tracking-wide">
              {project.description}
            </p>
          </div>
        </motion.div>

        {/* Additional Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-2 gap-8 md:gap-12"
        >
          <div>
            <h3 className="text-sm text-gray-400 font-light tracking-[0.3em] uppercase mb-4">
              Technologies
            </h3>
            <ul className="space-y-2">
              {project.technology_tags.map((tag, index) => (
                <li key={index} className="text-base text-gray-700 font-light">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 font-light tracking-[0.3em] uppercase mb-4">
              Liens
            </h3>
            <div className="space-y-3">
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-gray-700 hover:text-[#2563EB] font-light transition-colors duration-300"
                >
                  <Github size={18} />
                  <span>Repository GitHub</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Back to Projects CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-24 md:mt-32 pt-16 border-t border-gray-100 text-center"
        >
          <GlassButton onClick={() => navigate('/')} variant="primary">
            Voir tous les projets
          </GlassButton>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  )
}

export default ProjectDetail
