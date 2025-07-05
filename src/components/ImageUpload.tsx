'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string | null) => void
  uploadedImage: string | null
}

export default function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
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
          <div className="relative max-w-full overflow-hidden rounded-lg border border-border">
            <img
              src={uploadedImage}
              alt="Uploaded screenshot"
              className="max-w-full h-auto max-h-64 object-contain bg-background"
            />
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
    </div>
  )
}
