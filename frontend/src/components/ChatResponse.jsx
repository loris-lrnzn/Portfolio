import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const ChatResponse = ({ isOpen, onClose, response, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay pour fermer au clic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          />

          {/* Chat Response Container */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative rounded-3xl p-6 md:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors duration-200 group"
              >
                <X 
                  className="text-gray-600 group-hover:text-gray-900 transition-colors" 
                  size={16}
                />
              </button>

              {/* Content */}
              <div className="pr-8">
                {isLoading ? (
                  // Loader avec trois points qui sautent
                  <div className="flex items-center gap-2 py-4">
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        className="w-2 h-2 rounded-full bg-[#2563EB]"
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    <span className="ml-3 text-sm text-gray-500 font-light">
                      Réflexion en cours...
                    </span>
                  </div>
                ) : (
                  // Réponse
                  <div className="py-2">
                    <p className="text-base md:text-lg text-gray-800 font-light leading-relaxed tracking-wide">
                      {response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChatResponse
