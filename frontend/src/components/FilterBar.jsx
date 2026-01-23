import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

const FilterBar = ({ technologies, selectedFilters, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const allTechnologies = [...new Set(technologies.flat())]
  
  const filteredTechnologies = allTechnologies.filter(tech =>
    tech.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleFilter = (tech) => {
    if (selectedFilters.includes(tech)) {
      onFilterChange(selectedFilters.filter(t => t !== tech))
    } else {
      onFilterChange([...selectedFilters, tech])
    }
  }

  const handleClearAll = () => {
    onFilterChange([])
    setSearchQuery('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-20"
    >
      {/* Ultra Minimal Filter - Editorial Style */}
      <div className="space-y-6">
        {/* Search Input - Discret */}
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une technologie..."
            className="w-full px-0 py-2 bg-transparent border-0 border-b border-gray-200 focus:border-[#2563EB] focus:outline-none text-sm text-gray-600 placeholder-gray-400 font-light tracking-wide transition-colors duration-300"
          />
        </div>

        {/* Filter Tags - Ultra Minimal */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map((tech) => {
                const isSelected = selectedFilters.includes(tech)
                return (
                  <motion.button
                    key={tech}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ 
                      scale: 1.05,
                      color: isSelected ? undefined : '#2563EB'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleFilter(tech)}
                    className={`relative text-xs font-extralight tracking-[0.2em] uppercase transition-all duration-300 ${
                      isSelected
                        ? 'text-[#2563EB]'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tech}
                    {/* Underline effect when selected */}
                    {isSelected && (
                      <motion.div
                        layoutId="filter-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#2563EB]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-400 font-light tracking-wide"
              >
                Aucune technologie trouvée
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Button - Ultra Discret */}
        {selectedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-gray-600 font-extralight tracking-[0.3em] uppercase transition-colors duration-300"
            >
              <X size={10} />
              Réinitialiser
            </motion.button>
          </motion.div>
        )}

        {/* Active Filters Count - Subtle */}
        {selectedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <span className="text-[10px] text-gray-400 font-extralight tracking-[0.3em] uppercase">
              {selectedFilters.length} filtre{selectedFilters.length > 1 ? 's' : ''} actif{selectedFilters.length > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default FilterBar
