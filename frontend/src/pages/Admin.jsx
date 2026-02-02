import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, LogOut, X, Mail, Check } from 'lucide-react'
import axios from 'axios'
import CustomCursor from '../components/CustomCursor'
import ScrollProgress from '../components/ScrollProgress'
import Header from '../components/Header'
import GlassButton from '../components/GlassButton'

const API_URL = '/api'

const Admin = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('projects') // 'projects' | 'messages'
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technology_tags: '',
    image_url: '',
    github_link: ''
  })

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
        technology_tags: project.technology_tags.join(', '),
        image_url: project.image_url,
        github_link: project.github_link
      })
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        description: '',
        technology_tags: '',
        image_url: '',
        github_link: ''
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
      technology_tags: '',
      image_url: '',
      github_link: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const projectData = {
        ...formData,
        technology_tags: formData.technology_tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      if (editingProject) {
        await axios.put(`${API_URL}/admin/projects/${editingProject.id}`, projectData)
      } else {
        await axios.post(`${API_URL}/admin/projects`, projectData)
      }

      await fetchProjects()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Erreur lors de la sauvegarde du projet')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return
    }

    try {
      await axios.delete(`${API_URL}/admin/projects/${id}`)
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Erreur lors de la suppression du projet')
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/messages/${id}/read`)
      await fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white relative">
      <CustomCursor />
      <ScrollProgress />
      <Header />

      <div className="container mx-auto px-6 md:px-8 max-w-7xl pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] bg-clip-text text-transparent">
                Administration
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-light">
              Connecté en tant que <span className="text-gray-900">{user?.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              onClick={() => handleOpenModal()}
              className="px-6 py-3 rounded-full glass-strong text-gray-900 font-medium flex items-center gap-2 hover:shadow-lg transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Nouveau projet</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              onClick={handleLogout}
              className="px-6 py-3 rounded-full glass text-gray-900 font-medium flex items-center gap-2 hover:shadow-lg transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-gray-200"
        >
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'projects'
                ? 'border-[#2563EB] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Projets ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'border-[#2563EB] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Mail size={18} />
            Messages ({messages.filter(m => !m.isRead).length})
          </button>
        </motion.div>

        {/* Projects List */}
        {activeTab === 'projects' && (loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-light">Chargement...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  {project.image_url && (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="text-xl font-light mb-2 text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600 font-light mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                      onClick={() => handleOpenModal(project)}
                      className="p-2 rounded-full glass-light hover:glass-strong transition-colors duration-200"
                    >
                      <Edit2 size={16} className="text-gray-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                      onClick={() => handleDelete(project.id)}
                      className="p-2 rounded-full glass-light hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}

        {/* Messages List */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <Mail size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 font-light">Aucun message</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`glass-card rounded-2xl p-6 ${
                      msg.isRead ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {msg.fromEmail && (
                            <p className="text-sm text-gray-900 font-medium">
                              {msg.fromEmail}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {!msg.isRead && (
                            <span className="px-2 py-1 rounded-full bg-[#2563EB] text-white text-[10px] font-medium">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 font-light whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                      {!msg.isRead && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleMarkAsRead(msg.id)}
                          className="p-2 rounded-full glass-light hover:glass-strong transition-colors duration-200"
                          title="Marquer comme lu"
                        >
                          <Check size={16} className="text-green-600" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-light text-gray-900">
                  {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full glass-light hover:glass-strong transition-colors duration-200"
                >
                  <X size={20} className="text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs text-gray-500 font-light tracking-[0.2em] uppercase mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-gray-200 focus:border-[#2563EB] focus:outline-none text-gray-900 font-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-light tracking-[0.2em] uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-gray-200 focus:border-[#2563EB] focus:outline-none text-gray-900 font-light min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-light tracking-[0.2em] uppercase mb-2">
                    Technologies (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.technology_tags}
                    onChange={(e) => setFormData({ ...formData, technology_tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-gray-200 focus:border-[#2563EB] focus:outline-none text-gray-900 font-light"
                    placeholder="React, Node.js, MongoDB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-light tracking-[0.2em] uppercase mb-2">
                    URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-gray-200 focus:border-[#2563EB] focus:outline-none text-gray-900 font-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-light tracking-[0.2em] uppercase mb-2">
                    Lien GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github_link}
                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-light border border-gray-200 focus:border-[#2563EB] focus:outline-none text-gray-900 font-light"
                    required
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <GlassButton type="submit" variant="primary">
                    {editingProject ? 'Modifier' : 'Créer'}
                  </GlassButton>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-full glass text-gray-900 font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Admin
