import { motion } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const Skills = () => {
  const prefersReducedMotion = useReducedMotion()

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  // All skills in a flowing layout
  const allSkills = [
    'PHP 8', 'Symfony', 'React', 'Vue.js 3', 'TypeScript',
    'JavaScript ES6+', 'Tailwind CSS', 'HTML5', 'CSS3', 'MySQL',
    'Doctrine ORM', 'API REST', 'API Platform', 'Git/GitHub', 'Docker',
    'Figma', 'VS Code', 'WordPress'
  ]

  return (
    <section id="skills" className="py-32 md:py-40 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden" aria-labelledby="skills-title">
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
            Stack technique
          </span>
          <h2 id="skills-title" className="mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100">
            Technologies que{' '}
            <span className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent">
              je maîtrise
            </span>
          </h2>
        </motion.div>
      </div>

      {/* Full-width skills marquee */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-[#fafafa] dark:from-[#111113] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-[#fafafa] dark:from-[#111113] to-transparent z-10 pointer-events-none" />

        {/* Scrolling row 1 */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true },
            transition: { duration: 0.8 }
          })}
          className="flex gap-4 mb-4"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { x: [0, -1920] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 shrink-0"
          >
            {[...allSkills, ...allSkills].map((skill, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:border-primary-blue hover:text-primary-blue dark:hover:border-primary-cyan dark:hover:text-primary-cyan transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </motion.div>
          <motion.div
            animate={prefersReducedMotion ? {} : { x: [0, -1920] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 shrink-0"
          >
            {[...allSkills, ...allSkills].map((skill, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:border-primary-blue hover:text-primary-blue dark:hover:border-primary-cyan dark:hover:text-primary-cyan transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scrolling row 2 - reverse direction */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true },
            transition: { duration: 0.8, delay: 0.1 }
          })}
          className="flex gap-4"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { x: [-1920, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 shrink-0"
          >
            {[...allSkills.slice().reverse(), ...allSkills.slice().reverse()].map((skill, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                {skill}
              </span>
            ))}
          </motion.div>
          <motion.div
            animate={prefersReducedMotion ? {} : { x: [-1920, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 shrink-0"
          >
            {[...allSkills.slice().reverse(), ...allSkills.slice().reverse()].map((skill, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                {skill}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
