import { Router, Request, Response } from 'express'
import { GamificationService } from '../utils/gamification-service'
import { authMiddleware } from '../middleware/auth.middleware'

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

// POST /award-xp - Manually award XP (admin or system internal)
router.post('/award-xp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { action, content, refId } = req.body
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const result = await GamificationService.awardXP(userId, action, content, refId)
    res.json(result)
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('XP Award error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /leaderboard - Get the leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as 'all-time' | 'weekly' | 'monthly') || 'all-time'
    const limit = parseInt(req.query.limit as string) || 50
    
    const leaderboard = await GamificationService.getLeaderboard(type, limit)
    res.json({ success: true, data: leaderboard })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Leaderboard error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /progress/:userId - Get gamification progress for a user
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const progress = await GamificationService.getUserProgress(userId)
    
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress data not found for user' })
    }
    
    res.json({ success: true, data: progress })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('User progress error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /profile - Get current user gamification profile (shorthand for current user progress)
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }
    
    const progress = await GamificationService.getUserProgress(userId)
    res.json({ success: true, data: progress })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Gamification profile error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
