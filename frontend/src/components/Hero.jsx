import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import useReducedMotion from '../hooks/useReducedMotion'

const Hero = () => {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  const scrollToProjects = () => {
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  const letterVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: i * 0.04,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  }

  const firstName = "LORIS"
  const lastName = "LORENZINI"

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-bg overflow-hidden"
      aria-label="Présentation"
    >
      {/* Main content */}
      <motion.div
        className="relative z-10 text-center"
        style={prefersReducedMotion ? {} : { opacity, y }}
      >
        {/* Role */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <span className="w-12 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase">
            Développeur Full Stack
          </span>
          <span className="w-12 h-px bg-gray-300 dark:bg-gray-700" />
        </motion.div>

        {/* Name */}
        <h1>
          {/* LORIS */}
          <div className="overflow-hidden">
            <div className="flex justify-center">
              {firstName.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={prefersReducedMotion ? {} : letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-[17vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black tracking-[-0.04em] leading-[0.85] text-gray-900 dark:text-gray-100 inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          {/* LORENZINI */}
          <div className="overflow-hidden">
            <div className="flex justify-center bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text">
              {lastName.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  custom={index + firstName.length}
                  variants={prefersReducedMotion ? {} : letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-[17vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black tracking-[-0.04em] leading-[0.85] text-transparent inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>
        </h1>

        {/* Bottom info */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Disponible
            </span>
          </div>

          <span className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-700" />

          <motion.button
            onClick={scrollToProjects}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            className="group flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 font-medium hover:text-primary-blue dark:hover:text-primary-cyan transition-colors"
          >
            Voir les projets
            <ArrowDownRight size={16} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-[0.2em] uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 dark:from-gray-600 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
