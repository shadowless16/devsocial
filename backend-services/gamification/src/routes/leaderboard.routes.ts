import { Router } from 'express'
import { GamificationService } from '../services/gamification.service'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'all-time'
    const limit = parseInt(req.query.limit as string) || 50
    const result = await GamificationService.getLeaderboard(type, limit)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
