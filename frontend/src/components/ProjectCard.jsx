import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { Github, ExternalLink, ArrowUpRight } from 'lucide-react'

const ProjectCard = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])
  const scale = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX ** 2 + latestY ** 2)
      return isHovered ? 1 + distance * 0.05 : 1
    }
  )

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
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

  // Alterner la position de l'image (gauche/droite)
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? scale : 1,
        transformStyle: 'preserve-3d',
      }}
      className="group relative glass-chat rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer w-full"
    >
      <div className={`flex flex-col lg:flex-row ${isEven ? '' : 'lg:flex-row-reverse'}`}>
        {/* Image Container - Pleine largeur sur mobile, 50% sur desktop */}
        {project.image_url && (
          <div className="relative lg:w-1/2 h-64 lg:h-80 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 via-[#06B6D4]/10 to-purple-500/10 z-10"
              animate={{
                opacity: isHovered ? 0.3 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.15 : 1,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isEven 
                ? 'from-white via-white/60 to-transparent lg:from-transparent lg:via-white/60 lg:to-white' 
                : 'from-transparent via-white/60 to-white lg:from-white lg:via-white/60 lg:to-transparent'
            } z-10`} />
            
            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Content - Pleine largeur sur mobile, 50% sur desktop */}
        <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Title & Badge */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 group-hover:bg-gradient-to-r group-hover:from-[#2563EB] group-hover:to-[#06B6D4] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 flex-1 pr-4">
                {project.title}
              </h3>
              <motion.div
                animate={{
                  rotate: isHovered ? 45 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <ArrowUpRight className="text-white" size={18} />
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base lg:text-lg mb-6 leading-relaxed line-clamp-3">
              {project.description}
            </p>

            {/* Technology Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technology_tags.map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                  className="px-4 py-2 text-sm rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 font-semibold border border-gray-200/40"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/30">
            {project.github_link && (
              <motion.a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 font-semibold transition-colors duration-200 border border-gray-200/40"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={18} />
                <span>Code</span>
              </motion.a>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-bold transition-colors duration-200 shadow-lg shadow-blue-500/30"
            >
              <span>Découvrir</span>
              <ExternalLink size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovered
            ? 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)'
            : 'transparent',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default ProjectCard
