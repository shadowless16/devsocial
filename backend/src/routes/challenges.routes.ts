import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { ChallengeSystem } from '../utils/challenge-system'
import { ChallengeRecommender } from '../utils/challenge-recommender'

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

// GET / - List all active challenges
router.get('/', async (req: Request, res: Response) => {
  try {
    const challenges = await ChallengeSystem.getActiveChallenges()
    res.json({ success: true, data: { challenges } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching challenges:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch challenges' })
  }
})

// GET /recommended - Get personalized challenge recommendations
router.get('/recommended', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const limit = parseInt(req.query.limit?.toString() || '10')
    const recommendedChallenges = await ChallengeRecommender.getRecommendedChallenges(userId, limit)

    res.json({ 
      success: true,
      data: {
        challenges: recommendedChallenges,
        message: recommendedChallenges.length > 0 
          ? 'Challenges personalized for you' 
          : 'No personalized challenges available'
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Get recommended challenges error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /leaderboard - Get leaderboard for a specific challenge
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const challengeId = req.query.challengeId?.toString()
    if (!challengeId) {
      return res.status(400).json({ success: false, message: 'Challenge ID is required' })
    }

    const leaderboard = await ChallengeSystem.getChallengeLeaderboard(challengeId)
    res.json({ success: true, data: { leaderboard } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching challenge leaderboard:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' })
  }
})

// POST / - Create a new challenge (Admin only)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }

    const challengeData = req.body
    const challenge = await ChallengeSystem.createWeeklyChallenge(challengeData, req.user!.id)

    res.status(201).json({ success: true, data: { challenge } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error creating challenge:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to create challenge' })
  }
})

// POST /:challengeId/join - Join a challenge
router.post('/:challengeId/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { challengeId } = req.params

    const participation = await ChallengeSystem.joinChallenge(userId!, challengeId)
    res.status(201).json({ success: true, data: { participation } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error joining challenge:', errorMessage)
    res.status(500).json({ success: false, message: errorMessage })
  }
})

// POST /:challengeId/submit - Update challenge progress
router.post('/:challengeId/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { challengeId } = req.params
    const progressData = req.body

    await ChallengeSystem.updateProgress(userId!, challengeId, progressData)
    res.json({ success: true, message: 'Progress updated successfully' })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error updating challenge progress:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to update progress' })
  }
})

export default router
