import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import multer from 'multer'
import cloudinary from '../config/cloudinary'
import { UploadApiResponse } from 'cloudinary'

const router = Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

interface ApiError {
  message: string
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

// POST /api/upload - Handle file uploads (images/videos)
router.post('/', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' })
    }

    const isVideo = file.mimetype.startsWith('video/')
    const buffer = file.buffer
    
    let result: UploadApiResponse | undefined

    if (isVideo) {
      // Use upload_stream for videos
      result = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'posts',
            resource_type: 'video',
            chunk_size: 6000000,
            timeout: 120000,
            allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })
    } else {
      // For images
      const fileBase64 = `data:${file.mimetype};base64,${buffer.toString('base64')}`
      result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'posts',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        quality: 100,
        flags: 'preserve_transparency'
      })
    }

    if (!result) {
      return res.status(500).json({ success: false, message: 'Upload failed to return a result' })
    }

    res.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Upload error:', errorMessage)
    res.status(500).json({ success: false, message: 'Upload failed', details: errorMessage })
  }
})

// POST /api/upload/avatar - Specific route for avatar uploads
router.post('/avatar', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' })
    }

    const buffer = file.buffer
    const fileBase64 = `data:${file.mimetype};base64,${buffer.toString('base64')}`
    
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'avatars',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    })

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Avatar upload error:', errorMessage)
    res.status(500).json({ success: false, message: 'Avatar upload failed' })
  }
})

export default router
