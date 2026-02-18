import { motion } from 'framer-motion'
import { GraduationCap, Briefcase, Award } from 'lucide-react'
import useReducedMotion from '../hooks/useReducedMotion'

const Journey = () => {
  const prefersReducedMotion = useReducedMotion()

  const timeline = [
    {
      type: 'education',
      icon: GraduationCap,
      year: '2022 - 2024',
      title: 'Formation Développeur Full Stack',
      organization: 'École/Université',
      description: 'Formation intensive en développement web moderne avec React, Symfony et les technologies cloud.',
      tags: ['React', 'Symfony', 'Docker']
    },
    {
      type: 'work',
      icon: Briefcase,
      year: '2023 - Présent',
      title: 'Développeur Full Stack',
      organization: 'Freelance',
      description: 'Création de solutions web sur mesure pour divers clients, de la conception à la mise en production.',
      tags: ['Vue.js', 'Node.js', 'MongoDB']
    },
    {
      type: 'achievement',
      icon: Award,
      year: '2023',
      title: 'Projets Remarquables',
      organization: 'Portfolio Personnel',
      description: 'Développement de plusieurs applications web avec design moderne et performances optimisées.',
      tags: ['UI/UX', 'Performance', 'SEO']
    }
  ]

  const typeColors = {
    education: 'from-blue-500 to-cyan-500',
    work: 'from-purple-500 to-pink-500',
    achievement: 'from-orange-500 to-red-500'
  }

  const typeLabels = {
    education: 'Formation',
    work: 'Expérience professionnelle',
    achievement: 'Réalisation'
  }

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <section
      className="py-24 md:py-32 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-dark-bg"
      aria-labelledby="journey-title"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.8 }
          })}
          className="text-center mb-16 md:mb-20"
        >
          <motion.span
            {...getAnimationProps({
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.2 }
            })}
            className="text-xs text-gray-400 dark:text-gray-500 font-light tracking-[0.3em] uppercase mb-6 block"
          >
            Mon Parcours
          </motion.span>
          <h2 id="journey-title" className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.1] mb-6">
            <span className="text-gray-900 dark:text-gray-100">De la formation</span>
            <br />
            <span className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent">
              à la réalisation
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative" role="list" aria-label="Chronologie de mon parcours">
          {/* Vertical line - visible only on desktop */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary-blue/20 via-primary-cyan/20 to-transparent hidden md:block"
            aria-hidden="true"
          />

          <div className="space-y-8 md:space-y-12">
            {timeline.map((item, index) => (
              <motion.article
                key={index}
                {...getAnimationProps({
                  initial: { opacity: 0, y: 50 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-100px' },
                  transition: { duration: 0.6, delay: index * 0.2 }
                })}
                className={`flex flex-col md:flex-row gap-6 md:gap-8 items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                role="listitem"
                aria-label={`${typeLabels[item.type]}: ${item.title}`}
              >
                {/* Content */}
                <div className="flex-1 w-full">
                  <div
                    className={`glass-card rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    {/* Year badge */}
                    <motion.div
                      {...getAnimationProps({ whileHover: { scale: 1.05 } })}
                      className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${
                        typeColors[item.type]
                      } text-white text-xs font-medium mb-4`}
                    >
                      <time dateTime={item.year.split(' - ')[0]}>{item.year}</time>
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">
                      {item.organization}
                    </p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <ul
                      className={`flex flex-wrap gap-2 ${
                        index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                      }`}
                      aria-label="Technologies utilisées"
                    >
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          className="px-3 py-1 rounded-full glass-light text-xs text-gray-600 dark:text-gray-400 font-light"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 order-first md:order-none">
                  <motion.div
                    {...getAnimationProps({
                      whileHover: { scale: 1.1, rotate: 360 },
                      transition: { duration: 0.6 }
                    })}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${
                      typeColors[item.type]
                    } flex items-center justify-center shadow-lg`}
                    aria-hidden="true"
                  >
                    <item.icon size={24} className="text-white md:w-7 md:h-7" />
                  </motion.div>
                </div>

                {/* Spacer for layout */}
                <div className="flex-1 hidden md:block" aria-hidden="true" />
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Journey
