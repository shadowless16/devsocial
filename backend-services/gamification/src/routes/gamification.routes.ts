import { Router } from 'express'
import { GamificationService } from '../services/gamification.service'

const router = Router()

router.post('/award-xp', async (req, res) => {
  try {
    const { userId, action, content, refId } = req.body
    const result = await GamificationService.awardXP(userId, action, content, refId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
