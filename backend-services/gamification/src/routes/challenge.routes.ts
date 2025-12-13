import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: { challenges: [] } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/:challengeId/join', async (req, res) => {
  try {
    res.json({ success: true, message: 'Joined challenge' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/:challengeId/submit', async (req, res) => {
  try {
    res.json({ success: true, message: 'Submission received' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
