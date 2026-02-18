import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import useReducedMotion from '../hooks/useReducedMotion'

const Header = ({ darkHero = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'

  // On dark hero pages, use light text when not scrolled
  const useLightText = darkHero && !isScrolled

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const scrollToSection = useCallback((sectionId) => {
    setIsMobileMenuOpen(false)

    if (!isHomePage) {
      // Navigate to homepage with hash
      navigate(`/#${sectionId}`)
      return
    }

    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      })
    }
  }, [prefersReducedMotion, isHomePage, navigate])

  const navLinks = [
    { label: 'À propos', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Projets', id: 'projects' },
  ]

  const socialLinks = [
    { href: 'https://github.com/loris-lrnzn', icon: Github, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/loris-lorenzini/', icon: Linkedin, label: 'LinkedIn' },
    { href: 'mailto:lorislorenzini@outlook.com', icon: Mail, label: 'Email' },
  ]

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <>
      <motion.header
        {...getAnimationProps({
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 }
        })}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - fixed width for centering */}
            <div className="flex-1 flex items-center">
              <Link to="/" className={`font-semibold text-lg tracking-tight hover:opacity-70 transition-all ${
                useLightText ? 'text-white' : 'text-gray-900 dark:text-gray-100'
              }`}>
                LL
              </Link>
            </div>

            {/* Desktop Navigation - truly centered */}
            <nav className="hidden md:flex items-center justify-center gap-8" role="navigation" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-sm font-medium transition-colors ${
                    useLightText
                      ? 'text-white/80 hover:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    useLightText
                      ? 'text-white/80 hover:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right side - fixed width for centering */}
            <div className="flex-1 flex items-center justify-end gap-2">
              {/* Social Links - Desktop */}
              <div className="hidden md:flex items-center gap-1">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${
                      useLightText
                        ? 'text-white/70 hover:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>

              <ThemeToggle darkHero={useLightText} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden w-10 h-10 flex items-center justify-center transition-colors ${
                  useLightText
                    ? 'text-white/80 hover:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800 z-50 md:hidden"
              role="navigation"
              aria-label="Menu mobile"
            >
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="text-lg text-gray-900 dark:text-gray-100 font-medium py-2 text-left hover:text-primary-blue transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  {isAuthenticated && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg text-gray-900 dark:text-gray-100 font-medium py-2 hover:text-primary-blue transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </div>
                {/* Social Links - Mobile */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
