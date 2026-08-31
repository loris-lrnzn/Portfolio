import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ScrollProgress from '../components/ScrollProgress'
import useReducedMotion from '../hooks/useReducedMotion'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  // Rediriger vers /admin si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg relative flex items-center justify-center">
      <ScrollProgress />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary-blue/10 to-primary-cyan/10 dark:from-primary-blue/5 dark:to-primary-cyan/5 blur-3xl"
          {...getAnimationProps({
            animate: {
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            },
            transition: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          })}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary-cyan/10 to-purple-500/10 dark:from-primary-cyan/5 dark:to-purple-500/5 blur-3xl"
          {...getAnimationProps({
            animate: {
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            },
            transition: {
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }
          })}
        />
      </div>

      {/* Back Button - Top Left */}
      <motion.div
        {...getAnimationProps({
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.5 }
        })}
        className="absolute top-6 left-6"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>
      </motion.div>

      {/* Login Form */}
      <motion.div
        {...getAnimationProps({
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8 }
        })}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl dark:shadow-black/20 border border-gray-100 dark:border-gray-800">
          {/* Icon */}
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.1 }
            })}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-cyan flex items-center justify-center">
              <Lock size={28} className="text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.2 }
            })}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Accédez à l'interface d'administration
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-600 dark:text-red-400 font-light">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.3 }
              })}
            >
              <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium tracking-[0.15em] uppercase mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-cyan/20 text-gray-900 dark:text-gray-100 font-light transition-all duration-200"
                placeholder="admin"
                required
              />
            </motion.div>

            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.4 }
              })}
            >
              <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium tracking-[0.15em] uppercase mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-blue dark:focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-cyan/20 text-gray-900 dark:text-gray-100 font-light transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.5 }
              })}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-base hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
