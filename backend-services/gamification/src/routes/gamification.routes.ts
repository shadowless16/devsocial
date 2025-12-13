import { Router } from 'express'
import { GamificationService } from '../services/gamification.service'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/award-xp', authMiddleware, async (req: any, res) => {
  try {
    const { action, content, refId } = req.body
    const userId = req.user.id
    const result = await GamificationService.awardXP(userId, action, content, refId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
