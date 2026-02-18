import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Ref for throttling
  const lastMoveTime = useRef(0)
  const rafId = useRef(null)

  // Spring config - Ultra smooth (disabled for reduced motion)
  const springConfig = prefersReducedMotion
    ? { damping: 100, stiffness: 1000 } // Nearly instant
    : { damping: 25, stiffness: 400 }

  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Check for touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      )
    }

    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  // Throttled mouse move handler using requestAnimationFrame
  const moveCursor = useCallback((e) => {
    const now = performance.now()

    // Throttle to ~60fps (16ms)
    if (now - lastMoveTime.current < 16) {
      return
    }

    lastMoveTime.current = now

    // Cancel previous RAF if pending
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }

    rafId.current = requestAnimationFrame(() => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    })
  }, [cursorX, cursorY])

  useEffect(() => {
    // Don't initialize on touch devices
    if (isTouchDevice) return

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Show cursor when mouse enters viewport
    const handleDocumentMouseEnter = () => setIsVisible(true)
    const handleDocumentMouseLeave = () => setIsVisible(false)

    // WeakSet to track elements we've attached listeners to
    const trackedElements = new WeakSet()

    const attachListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .clickable-card, .cursor-pointer, [tabindex]:not([tabindex="-1"])'
      )

      interactiveElements.forEach((el) => {
        if (!trackedElements.has(el)) {
          trackedElements.add(el)
          el.addEventListener('mouseenter', handleMouseEnter)
          el.addEventListener('mouseleave', handleMouseLeave)
        }
      })
    }

    attachListeners()

    // Debounced MutationObserver
    let mutationTimeout = null
    const observer = new MutationObserver(() => {
      if (mutationTimeout) clearTimeout(mutationTimeout)
      mutationTimeout = setTimeout(attachListeners, 100)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    window.addEventListener('mousemove', moveCursor, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseenter', handleDocumentMouseEnter)
    document.addEventListener('mouseleave', handleDocumentMouseLeave)

    // Set initial visibility
    setIsVisible(true)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseenter', handleDocumentMouseEnter)
      document.removeEventListener('mouseleave', handleDocumentMouseLeave)
      observer.disconnect()

      if (mutationTimeout) clearTimeout(mutationTimeout)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [moveCursor, isTouchDevice])

  // Don't render on touch devices
  if (isTouchDevice) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* Simple dot cursor */}
      <motion.div
        className="w-1 h-1 rounded-full bg-gray-900 dark:bg-gray-100"
        animate={{
          scale: isClicking ? 0 : (isHovering ? 2 : 1),
          opacity: isClicking ? 0 : 1,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </motion.div>
  )
}

export default CustomCursor
