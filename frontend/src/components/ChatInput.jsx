import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send } from 'lucide-react'
import ChatResponse from './ChatResponse'

const ChatInput = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')
  const inputRef = useRef(null)

  // Focus sur l'input quand la barre s'ouvre
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleBarClick = () => {
    setIsExpanded(true)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Afficher le loader
    setIsLoading(true)
    setShowResponse(true)
    const question = inputValue
    setInputValue('')

    // Simuler une réponse après un délai
    setTimeout(() => {
      setIsLoading(false)
      setResponse(`Merci pour votre question "${question}" ! Je suis un assistant virtuel conçu pour vous aider à en savoir plus sur les projets de ce portfolio. N'hésitez pas à me poser des questions sur les technologies utilisées, les fonctionnalités, ou tout autre aspect qui vous intéresse.`)
    }, 2000)
  }

  const handleCloseResponse = () => {
    setShowResponse(false)
    setResponse('')
    setIsLoading(false)
  }

  return (
    <>
      {/* Barre de chat - Fixe en bas */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4"
      >
        <motion.div
          animate={{
            scale: isExpanded ? 1.02 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass-chat rounded-full w-full max-w-xl cursor-pointer clickable-card"
          onClick={handleBarClick}
        >
          {!isExpanded ? (
            // État fermé - Placeholder
            <div className="flex items-center gap-3 px-6 py-3 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="text-white" size={16} />
              </div>
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium text-sm">
                Poser une question à mon assistant...
              </span>
            </div>
          ) : (
            // État ouvert - Input
            <form onSubmit={handleSend} className="flex items-center gap-3 px-6 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="text-white" size={16} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tapez votre question..."
                className="flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500 text-sm font-medium focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Send className="text-white" size={14} />
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>

      {/* Composant ChatResponse */}
      <ChatResponse
        isOpen={showResponse}
        onClose={handleCloseResponse}
        response={response}
        isLoading={isLoading}
      />
    </>
  )
}

export default ChatInput
