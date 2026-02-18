import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'

const Typewriter = ({ words, className }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentText(words[0])
      return
    }

    const currentWord = words[currentWordIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1))
        } else {
          // Wait before deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, prefersReducedMotion])

  return (
    <span className={className}>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[3px] h-[1em] bg-primary-blue ml-1 align-middle"
      />
    </span>
  )
}

const About = () => {
  const prefersReducedMotion = useReducedMotion()

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  const typingWords = [
    "performantes.",
    "modernes.",
    "mémorables.",
    "qui claquent.",
    "innovantes.",
  ]

  return (
    <section
      id="about"
      className="py-32 md:py-40 bg-gray-50/50 dark:bg-gray-900/30"
      aria-labelledby="about-title"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header - centered like Services */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 40 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '-100px' },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          })}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase">
            À propos
          </span>
          <h2
            id="about-title"
            className="mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100"
          >
            Je crée des expériences{' '}
            <br className="hidden sm:block" />
            <Typewriter
              words={typingWords}
              className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent"
            />
          </h2>
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Left - Who */}
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
            })}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-primary-blue" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase">
                Qui je suis
              </span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Étudiant en dernière année de B.U.T. MMI, spécialisé en Développement Web à l'IUT de Saint-Dié-des-Vosges.
              Je possède une double expertise Back-end (Symfony, PHP, API REST) et Front-end (React, Vue.js).
            </p>
          </motion.div>

          {/* Right - How */}
          <motion.div
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
            })}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-primary-cyan" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase">
                Ma philosophie
              </span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Passionné par la conception d'applications web métier, je combine rigueur technique et créativité.
              Gestion de projet, travail en équipe et adaptabilité sont mes points forts.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
