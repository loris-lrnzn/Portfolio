import { motion } from 'framer-motion'
import { Copy, Check, Download } from 'lucide-react'
import { useState } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'

const CallToAction = () => {
  const prefersReducedMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const email = "lorislorenzini@outlook.com"

  const handleCopy = async (e) => {
    e.preventDefault()
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <section
      className="relative py-32 md:py-40 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden"
      aria-labelledby="cta-title"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-4xl relative">
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 40 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '-100px' },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          })}
          className="text-center"
        >
          {/* Label */}
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase">
            Contact
          </span>

          {/* Title with animated gradient */}
          <h2 id="cta-title" className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-gray-900 dark:text-gray-100">
            Un projet en tête ?
          </h2>

          {/* Animated gradient text */}
          <div className="mt-4 mb-16">
            <span
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight bg-clip-text text-transparent animate-gradient-shift"
              style={{
                backgroundImage: 'linear-gradient(90deg, #2563EB, #06B6D4, #2563EB, #06B6D4)',
                backgroundSize: '200% 100%',
              }}
            >
              Parlons-en.
            </span>
          </div>

          {/* Email link with underline animation */}
          <div className="mb-6">
            <a
              href={`mailto:${email}?subject=Prise de contact - Portfolio`}
              className="group relative inline-block text-xl sm:text-2xl md:text-3xl font-light text-gray-900 dark:text-gray-100 transition-colors"
            >
              {email}
              <span className="absolute bottom-0 left-0 w-full h-px bg-gray-900 dark:bg-gray-100 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
          </div>

          {/* Copy button */}
          <div className="mb-12">
            <motion.button
              onClick={handleCopy}
              {...getAnimationProps({
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copier l'email
                </>
              )}
            </motion.button>
          </div>

          {/* CV download */}
          <div className="mb-12">
            <motion.a
              href="/CV-Loris-Lorenzini.pdf"
              target="_blank"
              rel="noopener noreferrer"
              {...getAnimationProps({
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-primary-blue dark:hover:border-primary-cyan hover:text-primary-blue dark:hover:text-primary-cyan transition-colors"
            >
              <Download size={16} />
              Télécharger mon CV
            </motion.a>
          </div>

          {/* Status */}
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Disponible en alternance — rentrée 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction
