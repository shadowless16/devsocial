import { Router, Request, Response } from 'express'
import { Affiliation } from '../models'

const router = Router()

// GET /api/affiliations - Fetch the affiliations data
router.get('/', async (req: Request, res: Response) => {
  try {
    const affiliationRecord = await Affiliation.findOne({ type: 'affiliations' })
    if (!affiliationRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'No affiliations data found in database. Please run the load script first.' 
      })
    }

    res.json({ success: true, affiliations: affiliationRecord.data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed'
    console.error('Error fetching affiliations:', errorMessage)
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch affiliations: ${errorMessage}` 
    })
  }
})

export default router
