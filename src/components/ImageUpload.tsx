'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string | null) => void
  uploadedImage: string | null
}

export default function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
  const [showPreview, setShowPreview] = useState(false)
  
  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false)
      }
    }
    
    if (showPreview) {
      document.addEventListener('keydown', handleEscape)
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showPreview])
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onImageUpload(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeImage = () => {
    onImageUpload(null)
  }

  const handleImageClick = () => {
    console.log('🖼️ Image clicked, opening preview')
    setShowPreview(true)
  }

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-secondary rounded-full">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Screenshot hier ablegen...' : 'Screenshot hochladen'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ziehen Sie eine Datei hierher oder klicken Sie zum Auswählen
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Unterstützte Formate: JPEG, PNG, GIF, WebP (max. 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative bg-secondary rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <ImageIcon className="h-5 w-5 text-primary mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Screenshot hochgeladen
                </p>
                <p className="text-xs text-muted-foreground">
                  Bereit für die Analyse
                </p>
              </div>
              <button
                onClick={removeImage}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Bild entfernen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Image Preview */}
          <div className="relative max-w-full overflow-hidden rounded-lg border border-border group">
            <img
              src={uploadedImage}
              alt="Uploaded screenshot"
              className="max-w-full h-auto max-h-64 object-contain bg-background cursor-pointer"
              onClick={handleImageClick}
              title="Klicken für Vollbildansicht"
            />
            <div 
              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
              onClick={handleImageClick}
            >
              <div className="bg-black/70 rounded-full p-2">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          {/* Replace Button */}
          <button
            onClick={removeImage}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Anderes Bild hochladen
          </button>
        </div>
      )}
      
      {/* Fullscreen Preview Modal */}
      {showPreview && uploadedImage && (
        <>
          {console.log('🔍 Modal rendering, showPreview:', showPreview, 'uploadedImage exists:', !!uploadedImage)}
          <div 
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={() => {
              console.log('🔍 Modal background clicked, closing preview')
              setShowPreview(false)
            }}
            style={{ zIndex: 9999 }}
          >
            <div className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={uploadedImage}
                alt="Screenshot preview"
                className="max-w-full max-h-full object-contain block"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => {
                  console.log('🔍 Close button clicked')
                  setShowPreview(false)
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors z-10"
                title="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
              {/* ESC key hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                ESC oder außerhalb klicken zum Schließen
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
