import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const ProjectRow = ({ project, index, total }) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const rowRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Magnetic cursor effect for image with spring physics
  const springConfig = { stiffness: 150, damping: 15 }
  const imageXTransform = useTransform(x, (latest) => latest * 0.15)
  const imageYTransform = useTransform(y, (latest) => latest * 0.15)
  const imageX = useSpring(imageXTransform, springConfig)
  const imageY = useSpring(imageYTransform, springConfig)

  const handleMouseMove = (e) => {
    if (!rowRef.current) return
    const rect = rowRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  // Format number with leading zero
  const projectNumber = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/project/${project.id}`)}
      className="group relative w-full py-20 border-b border-gray-100 cursor-pointer overflow-hidden clickable-card"
      whileHover={{ 
        borderColor: 'rgba(37, 99, 235, 0.1)',
      }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-8 md:gap-12 relative z-10">
          {/* Left Side: Number & Title */}
          <div className="flex items-start gap-6 md:gap-12 flex-1 min-w-0">
            {/* Project Number */}
            <motion.span
              className="text-xs md:text-sm font-light tracking-widest flex-shrink-0"
              animate={{
                opacity: isHovered ? 0.8 : 1,
                color: isHovered ? '#2563EB' : '#9CA3AF',
              }}
              transition={{ duration: 0.4 }}
            >
              {projectNumber}
            </motion.span>

            {/* Title */}
            <motion.h3
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-[0.9] flex-1"
              animate={{
                x: isHovered ? 20 : 0,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <span className={isHovered ? 'bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] bg-clip-text text-transparent' : 'text-gray-900'}>
                {project.title}
              </span>
            </motion.h3>
          </div>

          {/* Right Side: Tags & Arrow */}
          <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
            {/* Technology Tags */}
            <div className="hidden md:flex items-center gap-4">
              {project.technology_tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  className="text-xs font-light tracking-widest uppercase"
                  animate={{
                    opacity: isHovered ? 0.8 : 0.5,
                    color: isHovered ? '#2563EB' : '#6B7280',
                  }}
                  transition={{ duration: 0.4, delay: tagIndex * 0.05 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Arrow Icon */}
            <motion.div
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm border flex items-center justify-center flex-shrink-0"
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 45 : 0,
                backgroundColor: isHovered ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isHovered ? 'rgba(37, 99, 235, 0.3)' : 'rgba(0, 0, 0, 0.1)',
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight 
                className={isHovered ? 'text-[#2563EB]' : 'text-gray-900'}
                size={isHovered ? 20 : 18}
              />
            </motion.div>
          </div>
        </div>

        {/* Mobile Tags */}
        <div className="md:hidden mt-6 flex items-center gap-3 flex-wrap">
          {project.technology_tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className={`text-xs font-light tracking-widest uppercase ${
                isHovered ? 'text-[#2563EB]' : 'text-gray-500'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Reveal Image on Hover - Magnetic Cursor Effect */}
      {project.image_url && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              x: useTransform(imageX, (latest) => latest * 50),
              y: useTransform(imageY, (latest) => latest * 50),
            }}
          >
            <motion.img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{
                scale: isHovered ? 1 : 1.3,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 }
              }}
            />
            {/* Subtle glass overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-white/90 backdrop-blur-[1px]" />
          </motion.div>
        </motion.div>
      )}

      {/* Subtle background gradient on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        animate={{
          opacity: isHovered ? 0.03 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-purple-500" />
      </motion.div>
    </motion.div>
  )
}

export default ProjectRow
