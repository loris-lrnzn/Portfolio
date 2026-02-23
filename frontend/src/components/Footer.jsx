import { motion } from 'framer-motion'
import { Github, Linkedin, Mail } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'

const Footer = ({ withChatPadding = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const year = new Date().getFullYear()

  const scrollToSection = useCallback((sectionId) => {
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
      }, 350)
      return
    }
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
  }, [location.pathname, navigate, prefersReducedMotion])

  const goToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [prefersReducedMotion])

  const navLinks = [
    { label: 'À propos', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Projets', id: 'projects' },
  ]

  const socials = [
    { label: 'GitHub', href: 'https://github.com/loris-lrnzn' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/loris-lorenzini/' },
    { label: 'Email', href: 'mailto:lorislorenzini@outlook.com' },
  ]

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <footer className="bg-gray-50/50 dark:bg-gray-900/30" role="contentinfo">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true, margin: '-50px' },
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          })}
          className={`py-16 ${withChatPadding ? 'pb-28' : ''}`}
        >
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div>
              <button
                onClick={goToTop}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight hover:text-primary-blue dark:hover:text-primary-cyan transition-colors"
                aria-label="Retour en haut de page"
              >
                Loris Lorenzini
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-light">
                Étudiant Développeur Web Full Stack
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase mb-4">
                Navigation
              </p>
              <nav className="flex flex-col gap-3" aria-label="Navigation du pied de page">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-light transition-colors text-left w-fit"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase mb-4">
                Contact
              </p>
              <div className="flex flex-col gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-light transition-colors w-fit"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
              © {year} Loris Lorenzini
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
              Conçu et développé avec passion
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
