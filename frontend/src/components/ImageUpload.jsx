import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, GripVertical } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      uploadFiles(files)
    }
    e.target.value = '' // Reset input
  }

  const uploadFiles = async (files) => {
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées`)
      return
    }

    setUploading(true)
    setError(null)

    const uploadedUrls = []

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('image', file)

        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_URL}/admin/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })

        if (response.data.url) {
          uploadedUrls.push(response.data.url)
        }
      } catch (err) {
        console.error('Upload error:', err)
        setError(err.response?.data?.error || 'Erreur lors de l\'upload')
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls])
    }

    setUploading(false)
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  // Drag and drop pour réordonner
  const handleImageDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleImageDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-3">
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary-blue bg-primary-blue/5 dark:border-primary-cyan dark:bg-primary-cyan/5'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-primary-blue dark:text-primary-cyan animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Glissez vos images ici
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ou cliquez pour sélectionner (max {maxImages} images, 5MB chacune)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Preview des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
              className={`relative group aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden w-full h-full items-center justify-center">
                <ImageIcon size={24} className="text-gray-400" />
              </div>

              {/* Badge numéro */}
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-blue text-white">
                  Principal
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <div className="p-1.5 rounded bg-white/90 cursor-grab">
                  <GripVertical size={14} className="text-gray-700" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 rounded bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Glissez pour réordonner. La première image sera l'image principale.
        </p>
      )}
    </div>
  )
}

export default ImageUpload
