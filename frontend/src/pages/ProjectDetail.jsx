import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Github, Calendar, ArrowUpRight } from 'lucide-react'
import axios from 'axios'
import Header from '../components/Header'
import ScrollProgress from '../components/ScrollProgress'
import Footer from '../components/Footer'
import ImageCarousel from '../components/ImageCarousel'
import useReducedMotion from '../hooks/useReducedMotion'

const API_URL = '/api'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [project, setProject] = useState(null)
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  useEffect(() => {
    fetchProject()
    fetchAllProjects()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/projects/${id}`)
        setProject(response.data)
        setError(null)
      } catch (err) {
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

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`)
      setAllProjects(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  // Find prev/next projects
  const currentIndex = allProjects.findIndex(p => p.id === parseInt(id))
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <ScrollProgress />
        <Header darkHero={false} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="inline-block w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mb-4"
              role="status"
              aria-label="Chargement"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <ScrollProgress />
        <Header darkHero={false} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{error || 'Projet non trouvé'}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 font-medium hover:text-primary-blue dark:hover:text-primary-cyan transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <ScrollProgress />
      <Header darkHero />

      {/* Hero Section - Full Screen with Parallax */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        {(project.images?.length > 0 || project.image_url) ? (
          <motion.div
            className="absolute inset-0"
            style={prefersReducedMotion ? {} : { y: heroImageY, scale: heroScale }}
          >
            <img
              src={project.images?.[0] || project.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        {/* Back Button */}
        <motion.button
          {...getAnimationProps({
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5, delay: 0.3 }
          })}
          onClick={() => navigate('/')}
          className="absolute top-24 left-4 md:left-8 z-20 flex items-center gap-2 text-sm text-white/80 hover:text-white font-medium transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </motion.button>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-24"
          style={prefersReducedMotion ? {} : { opacity: heroOpacity }}
        >
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            {/* Project Number */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.2 }
              })}
              className="mb-4"
            >
              <span className="text-white/60 text-sm font-medium tracking-[0.3em]">
                {currentIndex >= 0 ? `PROJET ${String(currentIndex + 1).padStart(2, '0')}` : 'PROJET'}
              </span>
            </motion.div>

            {/* Title with Animated Gradient */}
            <motion.h1
              {...getAnimationProps({
                initial: { opacity: 0, y: 40 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              })}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
            >
              <span
                className="bg-clip-text text-transparent animate-gradient-shift"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #fff, #06B6D4, #fff, #2563EB, #fff)',
                  backgroundSize: '200% 100%',
                }}
              >
                {project.title}
              </span>
            </motion.h1>

            {/* Meta Row */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.4 }
              })}
              className="flex flex-wrap items-center gap-4 md:gap-6"
            >
              {project.year && (
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar size={16} />
                  <span className="text-sm">{project.year}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                {project.technology_tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {project.technology_tags.length > 4 && (
                  <span className="text-white/60 text-xs">
                    +{project.technology_tags.length - 4}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 1 }
          })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-white/50 font-medium tracking-[0.2em] uppercase">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Overview Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid md:grid-cols-12 gap-12 md:gap-20">
            {/* Main Content */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-100px' },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              })}
              className="md:col-span-8"
            >
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase">
                Présentation
              </span>
              <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100">
                À propos du{' '}
                <span className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent">
                  projet
                </span>
              </h2>
              <p className="mt-8 text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                {project.description}
              </p>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-100px' },
                transition: { duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }
              })}
              className="md:col-span-4 space-y-8"
            >
              {/* Year */}
              {project.year && (
                <div className="pb-8 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase mb-2">
                    Année
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {project.year}
                  </p>
                </div>
              )}

              {/* Technologies */}
              <div className="pb-8 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase mb-4">
                  Technologies
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technology_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {(project.github_link || project.live_url) && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase mb-4">
                    Liens
                  </p>
                  <div className="space-y-3">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 rounded-xl bg-gray-900 dark:bg-white hover:opacity-90 transition-opacity"
                      >
                        <div className="flex items-center gap-3">
                          <ExternalLink size={18} className="text-white dark:text-gray-900" />
                          <span className="text-sm font-medium text-white dark:text-gray-900">
                            Voir le site
                          </span>
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="text-white/70 dark:text-gray-900/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </a>
                    )}
                    {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Github size={18} className="text-gray-700 dark:text-gray-300" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Code source
                          </span>
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="text-gray-400 group-hover:text-primary-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      {(project.images?.length > 0 || project.image_url) && (
        <section className="py-20 md:py-32 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-100px' },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              })}
              className="rounded-2xl overflow-hidden"
            >
              <ImageCarousel
                images={project.images?.length > 0 ? project.images : [project.image_url]}
                alt={project.title}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Navigation Section */}
      <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Previous Project */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, x: -20 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true },
                transition: { duration: 0.6 }
              })}
            >
              {prevProject ? (
                <Link
                  to={`/project/${prevProject.id}`}
                  className="group block rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all overflow-hidden"
                >
                  <div className="flex">
                    {/* Thumbnail */}
                    {(prevProject.images?.[0] || prevProject.image_url) && (
                      <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden">
                        <img
                          src={prevProject.images?.[0] || prevProject.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-gray-800/20" />
                      </div>
                    )}
                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-2">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Projet précédent</span>
                      </div>
                      <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-blue dark:group-hover:text-primary-cyan transition-colors line-clamp-1">
                        {prevProject.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 opacity-50">
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-3">
                    <ArrowLeft size={14} />
                    <span>Projet précédent</span>
                  </div>
                  <p className="text-xl font-semibold text-gray-400 dark:text-gray-600">
                    —
                  </p>
                </div>
              )}
            </motion.div>

            {/* Next Project */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, x: 20 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true },
                transition: { duration: 0.6 }
              })}
            >
              {nextProject ? (
                <Link
                  to={`/project/${nextProject.id}`}
                  className="group block rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all overflow-hidden"
                >
                  <div className="flex flex-row-reverse">
                    {/* Thumbnail */}
                    {(nextProject.images?.[0] || nextProject.image_url) && (
                      <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden">
                        <img
                          src={nextProject.images?.[0] || nextProject.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20 dark:to-gray-800/20" />
                      </div>
                    )}
                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-center text-right">
                      <div className="flex items-center justify-end gap-2 text-sm text-gray-400 dark:text-gray-500 mb-2">
                        <span>Projet suivant</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-blue dark:group-hover:text-primary-cyan transition-colors line-clamp-1">
                        {nextProject.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 opacity-50 text-right">
                  <div className="flex items-center justify-end gap-2 text-sm text-gray-400 dark:text-gray-500 mb-3">
                    <span>Projet suivant</span>
                    <ArrowRight size={14} />
                  </div>
                  <p className="text-xl font-semibold text-gray-400 dark:text-gray-600">
                    —
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Back to all projects */}
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.2 }
            })}
            className="mt-12 text-center"
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Voir tous les projets
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ProjectDetail
