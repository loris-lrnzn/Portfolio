import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const ImageCarousel = ({ images = [], alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Auto-play (pause on hover)
  useEffect(() => {
    if (images.length <= 1 || isHovered || prefersReducedMotion) return
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [images.length, isHovered, goToNext, prefersReducedMotion])

  if (!images || images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} - ${currentIndex + 1}`}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay for UI visibility */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

        {/* Click zones for navigation */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-0 w-1/3 h-full cursor-w-resize z-10 focus:outline-none"
          aria-label="Image précédente"
        />
        <button
          onClick={goToNext}
          className="absolute right-0 top-0 w-1/3 h-full cursor-e-resize z-10 focus:outline-none"
          aria-label="Image suivante"
        />
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{
            duration: isHovered || prefersReducedMotion ? 99999 : 5,
            ease: 'linear',
          }}
          key={currentIndex}
        />
      </div>

      {/* Minimal Index Indicator */}
      <div className="absolute bottom-6 right-6 z-20">
        <span className="text-white/90 text-sm font-medium tracking-wider">
          <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="text-white/50 mx-1">/</span>
          <span className="text-white/50">{String(images.length).padStart(2, '0')}</span>
        </span>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group p-1 focus:outline-none"
            aria-label={`Aller à l'image ${index + 1}`}
          >
            <div className={`relative h-0.5 transition-all duration-500 ${
              index === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 group-hover:bg-white/70'
            }`} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel
