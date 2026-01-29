import { motion, useScroll, useTransform } from 'framer-motion'
import { Code, Mail, Github, Instagram } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated } = useAuth()
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 20])
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50)
    })
    return () => unsubscribe()
  }, [scrollY])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`,
        scale: headerScale,
      }}
      className={`fixed top-0 left-0 right-0 z-50 glass border-b transition-colors duration-300 ${
        isScrolled ? 'border-gray-200/50' : 'border-gray-200/30'
      }`}
    >
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, type: 'tween', duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center group-hover:glass-strong transition-all duration-300">
                <Code className="text-gray-900" size={20} />
              </div>
              <span className="text-gray-900 font-semibold text-xl group-hover:text-[#2563EB] transition-colors duration-300">Portfolio</span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/"
                className="px-6 py-2.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white/60 transition-all duration-300 text-sm font-medium relative group block"
              >
                Accueil
                <motion.span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2563EB] rounded-full"
                  whileHover={{ width: '60%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/admin"
                  className="px-6 py-2.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white/60 transition-all duration-300 text-sm font-medium relative group block"
                >
                  Admin
                  <motion.span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2563EB] rounded-full"
                    whileHover={{ width: '60%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {[
              { href: 'https://github.com/loris-lrnzn', icon: Github },
              { href: 'https://instagram.com/loris_lrnzn', icon: Instagram },
              { href: 'mailto:lorislorenzini@outlook.com', icon: Mail }
            ].map((social, index) => (
              <motion.a
                key={social.href}
                href={social.href}
                target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-700 hover:text-gray-900 hover:glass transition-colors duration-200 cursor-pointer"
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
