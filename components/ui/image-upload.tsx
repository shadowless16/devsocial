import React, { useState, useCallback } from 'react'
// import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadToCloudinary, getHighQualityImageUrl } from '@/lib/storage/cloudinary'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUpload: (urls: string[]) => void
  maxFiles?: number
  maxSizeMB?: number
  folder?: string
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  url?: string
  error?: string
}

export function ImageUpload({ 
  onUpload, 
  maxFiles = 5, 
  maxSizeMB = 10,
  folder = 'projects',
  className = '' 
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const uploadFiles = useCallback(async (filesToUpload: UploadingFile[]) => {
    for (const uploadingFile of filesToUpload) {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === uploadingFile.file 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          )
        }, 200)

        const result = await uploadToCloudinary(uploadingFile.file, folder)
        
        clearInterval(progressInterval)
        
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === uploadingFile.file 
              ? { ...f, progress: 100, url: result.secure_url }
              : f
          )
        )

        setUploadedUrls(prev => {
          const newUrls = [...prev, result.secure_url]
          onUpload(newUrls)
          return newUrls
        })

      } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Upload failed:', errorMessage)
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === uploadingFile.file 
              ? { ...f, error: 'Upload failed' }
              : f
          )
        )
        toast.error(`Failed to upload ${uploadingFile.file.name}`)
      }
    }

    // Clean up completed uploads after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.progress < 100 && !f.error))
    }, 2000)
  }, [folder, onUpload]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`)
        return false
      }
      return true
    })

    if (uploadedUrls.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])
    uploadFiles(newUploadingFiles)
  }, [uploadedUrls.length, maxFiles, maxSizeMB, uploadFiles])

  const removeUploadedImage = (urlToRemove: string) => {
    setUploadedUrls(prev => {
      const newUrls = prev.filter(url => url !== urlToRemove)
      onUpload(newUrls)
      return newUrls
    })
  }

  const retryUpload = (failedFile: UploadingFile) => {
    setUploadingFiles(prev => 
      prev.map(f => 
        f.file === failedFile.file 
          ? { ...f, error: undefined, progress: 0 }
          : f
      )
    )
    uploadFiles([{ ...failedFile, error: undefined, progress: 0 }])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add('border-emerald-400')
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-emerald-400')
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-emerald-400')
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop images here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to {maxSizeMB}MB each (max {maxFiles} files)
        </p>
        <Button variant="outline" className="mt-4" type="button">
          Choose Files
        </Button>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploading...</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <ImageIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                {uploadingFile.error ? (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-red-600">{uploadingFile.error}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => retryUpload(uploadingFile)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Progress value={uploadingFile.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{uploadingFile.progress}%</p>
                  </div>
                )}
              </div>
              {uploadingFile.progress < 100 && !uploadingFile.error && (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Images ({uploadedUrls.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getHighQualityImageUrl(url)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  loading="lazy"
                />
                <button
                  onClick={() => removeUploadedImage(url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
