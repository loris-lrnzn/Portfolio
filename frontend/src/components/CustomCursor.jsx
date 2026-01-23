import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Spring config - Ultra smooth
  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    const attachListeners = () => {
      // Tous les éléments interactifs
      const interactiveElements = document.querySelectorAll(
        'a, button, input, [role="button"], .clickable-card, .cursor-pointer'
      )

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })

      return { interactiveElements }
    }

    const { interactiveElements } = attachListeners()

    const observer = new MutationObserver(() => {
      attachListeners()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      observer.disconnect()
    }
  }, [cursorX, cursorY])

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      {/* Simple dot cursor */}
      <motion.div
        className="w-1 h-1 rounded-full bg-gray-900"
        animate={{
          scale: isClicking ? 0 : (isHovering ? 2 : 1),
          opacity: isClicking ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </motion.div>
  )
}

export default CustomCursor
