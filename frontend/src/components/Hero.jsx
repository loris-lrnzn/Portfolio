import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import GlassButton from './GlassButton'
import { wordRevealVariants } from '../utils/textReveal'

const Hero = () => {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const titleWords = ["LORIS", "LORENZINI"]
  const subtitleWords = [
    "Développeur Full Stack passionné par la création",
    "d'expériences web modernes et innovantes"
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ opacity: useTransform(scrollYProgress, [0, 1], [0.3, 0]) }}
      >
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#2563EB]/10 to-[#06B6D4]/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#06B6D4]/10 to-purple-500/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      <motion.div 
        className="container mx-auto px-8 relative z-10"
        style={{ y, opacity, scale }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Name - Massive with letter reveal animation */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[14rem] font-black leading-[0.85] tracking-[-0.02em]">
              <motion.span 
                className="block text-gray-900"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                LORIS
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                LORENZINI
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle - Word by word reveal */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="mb-12 max-w-3xl"
          >
            <p className="text-2xl md:text-3xl text-gray-600 font-light leading-relaxed">
              {subtitleWords[0].split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordRevealVariants}
                  custom={i}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <span className="text-gray-500">
                {subtitleWords[1].split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordRevealVariants}
                    custom={i + subtitleWords[0].split(' ').length}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </p>
          </motion.div>

          {/* CTA Button with magnetic effect */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.2,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <GlassButton href="#projects" variant="primary">
              Découvrir mes projets
            </GlassButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 rounded-full bg-gray-400"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
