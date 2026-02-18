import { motion } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const Services = () => {
  const prefersReducedMotion = useReducedMotion()

  const services = [
    {
      title: 'Applications Web',
      description: 'Sites vitrines, SaaS, e-commerce. Des applications modernes, rapides et scalables.',
    },
    {
      title: 'API & Backend',
      description: 'Architectures robustes, APIs RESTful, microservices. Sécurisé et performant.',
    },
    {
      title: 'Conseil Technique',
      description: 'Choix technologiques, audit de code, optimisation. Un regard expert sur vos projets.',
    },
  ]

  const getAnimationProps = (props) => {
    if (prefersReducedMotion) return {}
    return props
  }

  return (
    <section id="services" className="py-32 md:py-40 bg-white dark:bg-dark-bg" aria-labelledby="services-title">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header */}
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
            Services
          </span>
          <h2 id="services-title" className="mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100">
            Ce que je peux{' '}
            <span className="bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-blue bg-clip-text text-transparent">
              faire pour vous
            </span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              {...getAnimationProps({
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-50px' },
                transition: { duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }
              })}
              className="group"
            >
              {/* Number */}
              <div className="text-6xl md:text-7xl font-semibold text-gray-100 dark:text-gray-800 mb-4 transition-colors group-hover:text-primary-blue/20 dark:group-hover:text-primary-blue/20">
                0{index + 1}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight mb-3 group-hover:text-primary-blue transition-colors">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-base text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {service.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
