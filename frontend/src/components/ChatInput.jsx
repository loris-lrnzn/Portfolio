import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Sparkles } from 'lucide-react'
import useReducedMotion from '../hooks/useReducedMotion'

const ChatInput = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll to bottom when new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }
  }, [messages, isLoading, prefersReducedMotion])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSend = useCallback(async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const question = inputValue.trim()
    setInputValue('')

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: question }])
    setIsLoading(true)

    const baseUrl = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8001'
    const chatUrl = `${baseUrl.replace(/\/$/, '')}/chatbot/portfolio/api/chat/`

    try {
      const res = await fetch(chatUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { type: 'assistant', content: data.reply }])

        // Handle actions
        if (data.action) {
          const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'
          if (data.action.type === 'anchor') {
            if (location.pathname !== '/') navigate('/')
            setTimeout(() => {
              const el = document.getElementById(data.action.id)
              if (el) el.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
            }, 400)
          } else if (data.action.type === 'project') {
            navigate(`/project/${data.action.id}`)
          }
        }
      } else {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: data.error || 'Une erreur est survenue. Réessayez plus tard.',
          isError: true
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Impossible de joindre l\'assistant. Vérifiez que le serveur est démarré.',
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, location.pathname, navigate, prefersReducedMotion])

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4">
      <motion.div
        ref={containerRef}
        {...getAnimationProps({
          initial: { y: 100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6, delay: 0.3 }
        })}
        className="w-full max-w-xl"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20, height: 0 },
                animate: { opacity: 1, y: 0, height: 'auto' },
                exit: { opacity: 0, y: 20, height: 0 },
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              })}
              className="mb-2 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-blue to-primary-cyan flex items-center justify-center">
                      <Sparkles className="text-white" size={12} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Assistant
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                    aria-label="Fermer l'assistant"
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                        <MessageCircle size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                        Posez-moi une question sur Loris,
                        <br />ses projets ou ses compétences.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      {...getAnimationProps({
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.2 }
                      })}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.type === 'user'
                            ? 'bg-primary-blue text-white rounded-br-md'
                            : msg.isError
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-bl-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      {...getAnimationProps({
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 }
                      })}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
                              {...getAnimationProps({
                                animate: { y: [0, -4, 0] },
                                transition: {
                                  duration: 0.5,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut"
                                }
                              })}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Votre question..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-blue/50 transition-shadow"
                      disabled={isLoading}
                    />
                    <motion.button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      {...getAnimationProps({
                        whileHover: { scale: 1.05 },
                        whileTap: { scale: 0.95 }
                      })}
                      className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      aria-label="Envoyer"
                    >
                      <Send size={16} className="text-white" />
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button / Collapsed State */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          {...getAnimationProps({
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 }
          })}
          className={`
            w-full rounded-full transition-all duration-300
            ${isOpen
              ? 'bg-gray-900 dark:bg-white'
              : 'bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl'
            }
          `}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        >
          <div className="flex items-center gap-3 px-5 py-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
              ${isOpen
                ? 'bg-white dark:bg-gray-900'
                : 'bg-gradient-to-br from-primary-blue to-primary-cyan shadow-lg'
              }
            `}>
              <MessageCircle
                className={isOpen ? 'text-gray-900 dark:text-white' : 'text-white'}
                size={16}
              />
            </div>
            <span className={`
              text-sm font-medium transition-colors duration-300
              ${isOpen
                ? 'text-white dark:text-gray-900'
                : 'text-gray-700 dark:text-gray-300'
              }
            `}>
              {isOpen ? 'Fermer l\'assistant' : 'Poser une question...'}
            </span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ChatInput
