import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { useState } from 'react'

const DynamicIsland = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {!isExpanded ? (
          // Collapsed state - Dynamic Island style
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            onClick={() => setIsExpanded(true)}
            className="glass-white rounded-full px-8 py-4 shadow-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <MessageCircle className="text-white" size={18} />
              </div>
              <span className="text-gray-900 text-sm font-semibold">Assistant</span>
            </div>
          </motion.div>
        ) : (
          // Expanded state
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="glass-white rounded-3xl shadow-2xl w-96 max-w-[90vw] mb-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <MessageCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">Assistant</h3>
                  <p className="text-gray-500 text-xs">En ligne</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-white/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat area */}
            <div className="p-5 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                <div className="glass-light rounded-2xl p-4">
                  <p className="text-gray-700 text-sm">
                    Bonjour ! Comment puis-je vous aider aujourd'hui ?
                  </p>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-5 border-t border-gray-200/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 glass-light border border-gray-200/50 rounded-full px-5 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:glass transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && message.trim()) {
                      setMessage('')
                    }
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                  onClick={() => {
                    if (message.trim()) {
                      setMessage('')
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white hover:shadow-lg transition-colors duration-200"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DynamicIsland
