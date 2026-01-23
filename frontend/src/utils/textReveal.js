// Utility pour animer le texte lettre par lettre
export const textRevealVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: {
      delay: i * 0.02,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
}

// Variant pour révélation de mot par mot
export const wordRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  })
}
