import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plus, Edit2, Trash2, LogOut, X, Check,
  Search, ExternalLink, FolderOpen,
  MessageSquare, Calendar, Image as ImageIcon, AlertTriangle, Bot,
  ArrowUp, ArrowDown, GripVertical
} from 'lucide-react'
import axios from 'axios'
import ScrollProgress from '../components/ScrollProgress'
import Header from '../components/Header'
import TagInput from '../components/TagInput'
import ImageUpload from '../components/ImageUpload'

const API_URL = '/api'

const Admin = () => {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // State
  const [activeTab, setActiveTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [chatLogs, setChatLogs] = useState([])
  const [chatbotEnabled, setChatbotEnabled] = useState(true)
  const [savingChatbot, setSavingChatbot] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'project' | 'message', id, title }
  const [editingProject, setEditingProject] = useState(null)

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [sortBy, setSortBy] = useState('manual') // 'manual', 'newest', 'oldest', 'alpha'

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technology_tags: [],
    images: [],
    github_link: '',
    live_url: '',
    year: ''
  })

  // Computed values
  const availableYears = useMemo(() => {
    const years = [...new Set(projects.map(p => p.year).filter(Boolean))]
    return years.sort((a, b) => b - a)
  }, [projects])

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technology_tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Year filter
    if (yearFilter) {
      result = result.filter(p => p.year === parseInt(yearFilter))
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => (a.year || 0) - (b.year || 0))
        break
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'newest':
        result.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'manual':
      default:
        result.sort((a, b) => (a.position || 0) - (b.position || 0))
    }

    return result
  }, [projects, searchQuery, yearFilter, sortBy])

  useEffect(() => {
    fetchProjects()
    fetchChatLogs()
    fetchSettings()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`)
      setChatbotEnabled(response.data.chatbot_enabled)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleToggleChatbot = async () => {
    const next = !chatbotEnabled
    try {
      setSavingChatbot(true)
      await axios.put(`${API_URL}/admin/settings`, { chatbot_enabled: next })
      setChatbotEnabled(next)
      toast.success(next ? 'Chatbot affiché sur le site' : 'Chatbot masqué du site')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Erreur lors de la mise à jour du réglage')
    } finally {
      setSavingChatbot(false)
    }
  }

  // L'ordre manuel n'est modifiable que si la liste affiche l'ordre réel du site
  const canReorder = sortBy === 'manual' && !searchQuery && !yearFilter

  // Déplace un projet d'une position à une autre, puis enregistre le nouvel ordre
  const moveProjectTo = async (from, to) => {
    if (from === to || from == null || to == null) return
    if (to < 0 || to >= filteredProjects.length) return

    const reordered = [...filteredProjects]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)

    // Mise à jour optimiste, puis persistance
    const previous = projects
    setProjects(reordered.map((p, i) => ({ ...p, position: i + 1 })))

    try {
      setReordering(true)
      await axios.put(`${API_URL}/admin/projects/reorder`, { ids: reordered.map(p => p.id) })
    } catch (error) {
      console.error('Error reordering projects:', error)
      setProjects(previous)
      toast.error("Erreur lors du changement d'ordre")
    } finally {
      setReordering(false)
    }
  }

  const handleMoveProject = (index, direction) => moveProjectTo(index, index + direction)

  // Glisser-déposer
  const handleDragStart = (index) => (e) => {
    if (!canReorder) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Firefox exige des données pour amorcer le glissement
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (index) => (e) => {
    if (!canReorder || draggedIndex === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== dragOverIndex) setDragOverIndex(index)
  }

  const handleDrop = (index) => (e) => {
    if (!canReorder || draggedIndex === null) return
    e.preventDefault()
    const from = draggedIndex
    setDraggedIndex(null)
    setDragOverIndex(null)
    moveProjectTo(from, index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const fetchChatLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/chat-logs`)
      setChatLogs(response.data)
    } catch (error) {
      console.error('Error fetching chat logs:', error)
    }
  }

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        title: project.title,
        description: project.description,
        technology_tags: project.technology_tags || [],
        images: (project.images || [project.image_url]).filter(Boolean),
        github_link: project.github_link || '',
        live_url: project.live_url || '',
        year: project.year?.toString() || ''
      })
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        description: '',
        technology_tags: [],
        images: [],
        github_link: '',
        live_url: '',
        year: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setFormData({
      title: '',
      description: '',
      technology_tags: [],
      images: [],
      github_link: '',
      live_url: '',
      year: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.technology_tags.length === 0) {
      toast.error('Ajoutez au moins une technologie')
      return
    }

    if (formData.images.length === 0) {
      toast.error('Ajoutez au moins une image')
      return
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        technology_tags: formData.technology_tags,
        images: formData.images,
        github_link: formData.github_link,
        live_url: formData.live_url || null,
        year: formData.year ? parseInt(formData.year) : null
      }

      if (editingProject) {
        await axios.put(`${API_URL}/admin/projects/${editingProject.id}`, projectData)
        toast.success('Projet modifié avec succès')
      } else {
        await axios.post(`${API_URL}/admin/projects`, projectData)
        toast.success('Projet créé avec succès')
      }

      await fetchProjects()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Erreur lors de la sauvegarde du projet')
    }
  }

  const handleDeleteClick = (type, id, title) => {
    setDeleteTarget({ type, id, title })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'project') {
        await axios.delete(`${API_URL}/admin/projects/${deleteTarget.id}`)
        await fetchProjects()
        toast.success('Projet supprimé')
      } else if (deleteTarget.type === 'chatlog') {
        await axios.delete(`${API_URL}/admin/chat-logs/${deleteTarget.id}`)
        await fetchChatLogs()
        toast.success('Conversation supprimée')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.info('Déconnecté')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg relative">
      <ScrollProgress />
      <Header />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-1 text-gray-900 dark:text-gray-100">
              Administration
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bienvenue, <span className="text-gray-900 dark:text-gray-100 font-medium">{user?.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenModal()}
              className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity text-sm cursor-pointer"
            >
              <Plus size={18} className="pointer-events-none" />
              <span className="pointer-events-none">Nouveau projet</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut size={18} className="pointer-events-none" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <FolderOpen size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{projects.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Projets</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Bot size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{chatLogs.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Conversations</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{availableYears[0] || '-'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dernier projet</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-1 mb-6 bg-white dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800 w-fit"
        >
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'projects'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Projets
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'conversations'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Conversations
            {chatLogs.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'conversations'
                  ? 'bg-white/20 dark:bg-gray-900/20'
                  : 'bg-green-500 text-white'
              }`}>
                {chatLogs.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-primary-blue"
                >
                  <option value="">Toutes les années</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-primary-blue"
                >
                  <option value="manual">Ordre du site</option>
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alpha">A-Z</option>
                </select>
              </div>
            </motion.div>

            {/* Indication : ordre modifiable */}
            {canReorder && !loading && filteredProjects.length > 1 && (
              <p className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <GripVertical size={14} className="text-gray-400 dark:text-gray-500" />
                Glissez-déposez les projets pour définir leur ordre sur le site, ou utilisez les flèches.
              </p>
            )}

            {/* Projects Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <FolderOpen size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || yearFilter ? 'Aucun projet trouvé' : 'Aucun projet'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      draggable={canReorder}
                      onDragStart={handleDragStart(index)}
                      onDragOver={handleDragOver(index)}
                      onDrop={handleDrop(index)}
                      onDragEnd={handleDragEnd}
                      className={`group bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-lg dark:hover:shadow-black/10 ${
                        canReorder ? 'cursor-grab active:cursor-grabbing' : ''
                      } ${
                        draggedIndex === index
                          ? 'opacity-40 border-gray-100 dark:border-gray-800'
                          : dragOverIndex === index && draggedIndex !== null
                            ? 'border-primary-blue dark:border-primary-cyan ring-2 ring-primary-blue/40 dark:ring-primary-cyan/40'
                            : 'border-gray-100 dark:border-gray-800'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                        {(project.images?.[0] || project.image_url) ? (
                          <img
                            src={project.images?.[0] || project.image_url}
                            alt={project.title}
                            draggable={false}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {project.images?.length > 1 && (
                          <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium">
                            +{project.images.length - 1}
                          </span>
                        )}
                        {/* Ordre d'affichage sur le site */}
                        {canReorder && (
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium tabular-nums">
                              {index + 1}
                            </span>
                            <button
                              onClick={() => handleMoveProject(index, -1)}
                              disabled={index === 0 || reordering}
                              title="Monter dans la liste du site"
                              aria-label={`Monter ${project.title}`}
                              className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp size={14} className="pointer-events-none" />
                            </button>
                            <button
                              onClick={() => handleMoveProject(index, 1)}
                              disabled={index === filteredProjects.length - 1 || reordering}
                              title="Descendre dans la liste du site"
                              aria-label={`Descendre ${project.title}`}
                              className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown size={14} className="pointer-events-none" />
                            </button>
                          </div>
                        )}
                        {/* Quick actions overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Link
                            to={`/project/${project.id}`}
                            className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors cursor-pointer"
                            title="Voir sur le site"
                          >
                            <ExternalLink size={16} className="text-gray-700 pointer-events-none" />
                          </Link>
                          <button
                            onClick={() => handleOpenModal(project)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 size={16} className="text-gray-700 pointer-events-none" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick('project', project.id, project.title)}
                            className="p-2 rounded-lg bg-red-500/90 hover:bg-red-500 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="text-white pointer-events-none" />
                          </button>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{project.title}</h3>
                          {project.year && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{project.year}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technology_tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                              {tag}
                            </span>
                          ))}
                          {project.technology_tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">+{project.technology_tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="space-y-3">
            {/* Réglage : affichage du chatbot sur le site */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Chatbot sur le site
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {chatbotEnabled
                    ? 'Le chatbot est visible par les visiteurs.'
                    : 'Le chatbot est masqué. Les visiteurs ne le voient pas.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={chatbotEnabled}
                aria-label="Afficher le chatbot sur le site"
                onClick={handleToggleChatbot}
                disabled={savingChatbot}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                  chatbotEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    chatbotEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {chatLogs.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <Bot size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune conversation</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {chatLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Date */}
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {/* Question */}
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-medium flex-shrink-0 mt-0.5">
                            Visiteur
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {log.question}
                          </p>
                        </div>

                        {/* Answer */}
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-medium flex-shrink-0 mt-0.5">
                            Bot
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {log.answer}
                          </p>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteClick('chatlog', log.id, 'cette conversation')}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                    Technologies
                  </label>
                  <TagInput
                    tags={formData.technology_tags}
                    onChange={(tags) => setFormData({ ...formData, technology_tags: tags })}
                    placeholder="Ajouter une technologie..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                    Images
                  </label>
                  <ImageUpload
                    images={formData.images}
                    onChange={(images) => setFormData({ ...formData, images: images })}
                    maxImages={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                      Année
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                      Lien GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.github_link}
                      onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1.5">
                    Lien Live (démo)
                  </label>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="https://mon-projet.com"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    {editingProject ? 'Enregistrer' : 'Créer le projet'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 shadow-2xl"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {deleteTarget.title}
                </span>
                ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Admin
