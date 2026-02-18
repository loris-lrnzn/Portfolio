import { useState, useRef } from 'react'
import { X } from 'lucide-react'

const TagInput = ({ tags = [], onChange, placeholder = 'Ajouter...' }) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  // Suggestions de technologies courantes
  const suggestions = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript',
    'Node.js', 'Express', 'Symfony', 'Laravel', 'Django',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis',
    'Docker', 'AWS', 'Tailwind CSS', 'SASS'
  ].filter(s => !tags.includes(s))

  return (
    <div className="space-y-2">
      {/* Input avec tags */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:border-primary-blue dark:focus-within:border-primary-cyan focus-within:ring-2 focus-within:ring-primary-blue/20 dark:focus-within:ring-primary-cyan/20 transition-all cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />
      </div>

      {/* Suggestions rapides */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagInput
