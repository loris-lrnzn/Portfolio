import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const GlassButton = ({ children, href, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = 'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2 group'
  
  const variants = {
    primary: 'real-glass text-gray-900 hover:shadow-xl hover:scale-[1.02]',
    secondary: 'glass text-gray-900 hover:glass-strong'
  }

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {content}
    </motion.button>
  )
}

export default GlassButton
