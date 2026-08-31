import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'
import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import Skills from '../components/Skills'
import FilterBar from '../components/FilterBar'
import ProjectList from '../components/ProjectList'
import CallToAction from '../components/CallToAction'
import ChatInput from '../components/ChatInput'
import ScrollProgress from '../components/ScrollProgress'
import ScrollToTop from '../components/ScrollToTop'
import Footer from '../components/Footer'
import useReducedMotion from '../hooks/useReducedMotion'
import useSeo from '../hooks/useSeo'

const API_URL = '/api'

const Home = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [chatbotEnabled, setChatbotEnabled] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()

  useSeo({
    title: 'Développeur Web Full Stack',
    description: "Portfolio de Loris Lorenzini, développeur web full stack (Symfony, React, Django, Docker). En recherche d'une alternance pour le Mastère CTO & Tech Lead à HETIC.",
    path: '/',
  })

  useEffect(() => {
    // Le chatbot n'est affiché que s'il est activé dans l'administration
    axios.get(`${API_URL}/settings`)
      .then(({ data }) => setChatbotEnabled(data.chatbot_enabled))
      .catch(() => setChatbotEnabled(false))
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [])

  // Handle hash navigation (e.g., /#about)
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '')
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          window.scrollTo({
            top: elementPosition - offset,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          })
        }
      }, 100)
    }
  }, [location.hash, prefersReducedMotion])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/projects`)
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError('Erreur de connexion avec le backend')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = useMemo(() => {
    if (selectedFilters.length === 0) {
      return projects
    }
    return projects.filter(project =>
      project.technology_tags.some(tag =>
        selectedFilters.some(filter =>
          tag.toLowerCase().includes(filter.toLowerCase())
        )
      )
    )
  }, [projects, selectedFilters])

  const allTechnologies = useMemo(() => {
    return projects.flatMap(p => p.technology_tags)
  }, [projects])

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg relative">
      {/* Skip to content link - Accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Aller au contenu principal
      </a>

      {/* Custom Cursor - Desktop only */}

      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <Hero />

        {/* About Section - Plus personnel */}
        <About />

        {/* Services Section - Ce que je propose */}
        <Services />

        {/* Skills Section */}
        <Skills />

        {/* Projects Section */}
        <section id="projects" className="py-32 md:py-40 bg-white dark:bg-dark-bg" aria-labelledby="projects-title">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            {/* Section Header */}
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-100px' },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              })}
              className="text-center mb-20 md:mb-24"
            >
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase">
                Portfolio
              </span>
              <h2 id="projects-title" className="mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100">
                Mes{' '}
                <span className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent">
                  projets
                </span>
              </h2>
            </motion.div>

            {/* Filter Bar */}
            {projects.length > 0 && (
              <div className="mb-16">
                <FilterBar
                  technologies={allTechnologies}
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                />
              </div>
            )}
          </div>

          {/* Project List */}
          <ProjectList
            projects={filteredProjects}
            loading={loading}
            error={error}
          />
        </section>

        {/* Call to Action - Avant le footer */}
        <CallToAction />
      </main>

      <Footer withChatPadding={chatbotEnabled} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Chatbot Bar - Fixed at bottom (activable depuis l'administration) */}
      {chatbotEnabled && <ChatInput />}
    </div>
  )
}

export default Home
