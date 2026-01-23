import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Header from './components/Header'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import ProjectList from './components/ProjectList'
import ChatInput from './components/ChatInput'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'

const API_URL = 'http://localhost:8000/api'

function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState([])

  useEffect(() => {
    fetchProjects()
  }, [])

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

  // Filter projects based on selected technologies
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

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    return projects.flatMap(p => p.technology_tags)
  }, [projects])

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Cursor - Always visible */}
      <CustomCursor />
      
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Projects Section - Editorial Style */}
      <section id="projects" className="bg-white">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          {/* Section Header - Ultra Minimal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-10 pb-10 text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs text-gray-400 font-light tracking-[0.3em] uppercase mb-8 block"
            >
              Portfolio
            </motion.span>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-[0.85] mb-6">
              <span className="text-gray-900">Pro</span>
              <span className="bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] bg-clip-text text-transparent">jets</span>
            </h2>
            <p className="text-sm text-gray-500 font-light tracking-wide max-w-xl mx-auto">
              Une sélection de mes réalisations les plus récentes
            </p>
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

        {/* Project List - Full Width Editorial */}
        <ProjectList
          projects={filteredProjects}
          loading={loading}
          error={error}
        />
      </section>

      {/* Chatbot Bar - Fixed at bottom */}
      <ChatInput />
    </div>
  )
}

export default App
