import { motion } from 'framer-motion'
import { Github, Instagram, Mail, ArrowUpRight, ArrowUp } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import axios from 'axios'

const Footer = ({ withChatPadding = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const year = new Date().getFullYear()
  const messageRef = useRef(null)
  const [fromEmail, setFromEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null) // 'success' | 'error' | null

  const goToProjects = () => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById('projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
      return
    }
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const focusMessage = () => {
    messageRef.current?.focus()
  }

  const sendMail = async () => {
    const cleanMessage = message.trim()
    if (!cleanMessage) return

    setIsSending(true)
    setSendStatus(null)

    try {
      await axios.post('/api/messages', {
        fromEmail: fromEmail.trim() || null,
        message: cleanMessage,
      })

      setSendStatus('success')
      setFromEmail('')
      setMessage('')

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => setSendStatus(null), 3000)
    } catch (error) {
      console.error('Erreur lors de l&apos;envoi du message:', error)
      setSendStatus('error')

      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => setSendStatus(null), 3000)
    } finally {
      setIsSending(false)
    }
  }

  const socials = [
    { label: 'GitHub', href: 'https://github.com/loris-lrnzn', icon: Github },
    { label: 'Instagram', href: 'https://instagram.com/loris_lrnzn', icon: Instagram },
    { label: 'Email', href: 'mailto:lorislorenzini@outlook.com', icon: Mail },
  ]

  return (
    <footer className="bg-white">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`border-t border-gray-100 pt-8 ${withChatPadding ? 'pb-32' : 'pb-10'}`}
        >
          <div className="grid md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center">
                  <span className="text-gray-900 font-semibold text-sm tracking-tight">LL</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium tracking-tight">Loris Lorenzini</p>
                  <p className="text-xs text-gray-500 font-light tracking-wide">Développeur Full Stack</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                <div>
                <p className="text-[10px] text-gray-400 font-light tracking-[0.35em] uppercase mb-3">
                  Navigation
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={goToProjects}
                    className="group flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-light transition-colors duration-200"
                  >
                    Projets
                    <ArrowUpRight size={14} className="opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                  <button
                    type="button"
                    onClick={goToTop}
                    className="group flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-light transition-colors duration-200"
                  >
                    Haut de page
                    <ArrowUp size={14} className="opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-light tracking-[0.35em] uppercase mb-3">
                  Liens
                </p>
                <div className="space-y-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={s.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="group flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-light transition-colors duration-200"
                    >
                      <s.icon size={16} className="text-gray-500 group-hover:text-gray-900 transition-colors duration-200" />
                      <span>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-light tracking-[0.35em] uppercase mb-3">
                  Envoyer un message
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMail()
                  }}
                  className="glass-card rounded-2xl p-3 border border-gray-200/40"
                >
                  <div className="space-y-2.5">
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="Ton email (optionnel)"
                      className="w-full px-0 py-2 bg-transparent border-0 border-b border-gray-200/70 focus:border-[#2563EB] focus:outline-none text-sm text-gray-700 placeholder-gray-400 font-light tracking-wide transition-colors duration-200"
                    />
                    <textarea
                      ref={messageRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      placeholder="Ton message…"
                      className="w-full resize-none px-0 py-2 bg-transparent border-0 border-b border-gray-200/70 focus:border-[#2563EB] focus:outline-none text-sm text-gray-700 placeholder-gray-400 font-light tracking-wide transition-colors duration-200"
                    />
                    <div className="flex items-center justify-between pt-1">
                      {sendStatus === 'success' ? (
                        <p className="text-[11px] text-green-600 font-light">
                          Message envoyé !
                        </p>
                      ) : sendStatus === 'error' ? (
                        <p className="text-[11px] text-red-600 font-light">
                          Erreur d'envoi
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 font-light">
                          Envoi direct
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSending}
                        className="px-4 py-2 rounded-full glass-light hover:glass-strong text-sm text-gray-900 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-xs text-gray-400 font-light tracking-wide">
              © {year} Loris Lorenzini. Tous droits réservés.
            </p>
            <button
              type="button"
              onClick={focusMessage}
              className="text-xs text-gray-400 hover:text-gray-900 font-light tracking-wide transition-colors duration-200"
            >
              M’envoyer un message
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

