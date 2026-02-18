import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plus, Edit2, Trash2, LogOut, X, Mail, Check,
  Search, Filter, ExternalLink, Reply, FolderOpen,
  MessageSquare, Calendar, Image as ImageIcon, AlertTriangle
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
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'project' | 'message', id, title }
  const [editingProject, setEditingProject] = useState(null)

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'alpha'

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
      default:
        result.sort((a, b) => (b.year || 0) - (a.year || 0))
    }

    return result
  }, [projects, searchQuery, yearFilter, sortBy])

  const unreadMessages = useMemo(() => messages.filter(m => !m.isRead).length, [messages])

  useEffect(() => {
    fetchProjects()
    fetchMessages()
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

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
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
      } else if (deleteTarget.type === 'message') {
        await axios.delete(`${API_URL}/admin/messages/${deleteTarget.id}`)
        await fetchMessages()
        toast.success('Message supprimé')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/messages/${id}/read`)
      await fetchMessages()
      toast.success('Message marqué comme lu')
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast.error('Erreur')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.info('Déconnecté')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg relative default-cursor">
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                <MessageSquare size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{messages.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <Mail size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{unreadMessages}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Non lus</p>
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
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Messages
            {unreadMessages > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'messages'
                  ? 'bg-white/20 dark:bg-gray-900/20'
                  : 'bg-orange-500 text-white'
              }`}>
                {unreadMessages}
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
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alpha">A-Z</option>
                </select>
              </div>
            </motion.div>

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
                      className="group bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-black/10 transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                        {(project.images?.[0] || project.image_url) ? (
                          <img
                            src={project.images?.[0] || project.image_url}
                            alt={project.title}
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

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <Mail size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun message</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.03 }}
                    className={`bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 ${
                      msg.isRead ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.isRead
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <Mail size={18} className={msg.isRead ? 'text-gray-400' : 'text-orange-500'} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {msg.fromEmail || 'Anonyme'}
                          </p>
                          {!msg.isRead && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-medium">
                              Nouveau
                            </span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {msg.fromEmail && (
                          <a
                            href={`mailto:${msg.fromEmail}?subject=Re: Message depuis votre portfolio`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Répondre"
                          >
                            <Reply size={16} className="text-gray-500 dark:text-gray-400" />
                          </a>
                        )}
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check size={16} className="text-green-600 dark:text-green-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick('message', msg.id, 'ce message')}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                        </button>
                      </div>
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
