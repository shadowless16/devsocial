import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { XPOvertakeService } from '../utils/xp-overtake-service'

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

// POST /api/xp-overtakes/check - Manually trigger XP overtake check
router.post('/check', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type = 'all-time' } = req.body
    const validType = type as 'weekly' | 'monthly' | 'all-time'
    
    const result = await XPOvertakeService.checkAndNotifyOvertakes(validType)
    res.json(result)
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('XP overtake check error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to check overtakes' })
  }
})

// GET /api/xp-overtakes/check - Manually trigger XP overtake check via GET
router.get('/check', authMiddleware, async (req: Request, res: Response) => {
  try {
    const type = req.query.type?.toString() || 'all-time'
    const validType = type as 'weekly' | 'monthly' | 'all-time'
    
    const result = await XPOvertakeService.checkAndNotifyOvertakes(validType)
    res.json(result)
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('XP overtake check error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to check overtakes' })
  }
})

export default router
