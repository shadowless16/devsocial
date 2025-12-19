import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { User } from '../models'
import { getAvatarUrl } from '../utils/avatar-utils'

const router = Router()

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

// POST /api/save-avatar - Save or update user avatar
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { avatarUrl } = req.body
    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'avatarUrl is required' })
    }

    // Validate URL format (allow .glb with query params)
    if (!avatarUrl.includes('models.readyplayer.me')) {
      return res.status(400).json({ success: false, message: 'Invalid avatar URL' })
    }

    // Normalize to png (strip query params and convert .glb -> .png)
    const normalizedAvatar = getAvatarUrl(avatarUrl)

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: normalizedAvatar },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({ 
      success: true, 
      avatarUrl: normalizedAvatar,
      message: 'Avatar saved successfully' 
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Save avatar error:', errorMessage)
    res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` })
  }
})

export default router
