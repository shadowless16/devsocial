import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { geminiPublicService } from '../services/ai/gemini-public-service'
import { User } from '../models'
import multer from 'multer'

const router = Router()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
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

// POST /api/ai/analyze-image - Analyze image using Gemini 2.0
router.post('/analyze-image', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const imageFile = req.file
    const action = req.body.action || 'analyze'
    
    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Image file is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`
    
    const usage = user.imageAnalysisUsage || {}
    const monthlyUsage = usage[monthKey] || 0
    const monthlyLimit = user.isPremium ? 100 : 10
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return res.status(429).json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} image analyses reached.`
      })
    }

    const base64Image = imageFile.buffer.toString('base64')
    
    let result: string
    if (action === 'describe') {
      result = await geminiPublicService.describeImage(base64Image, imageFile.mimetype)
    } else {
      result = await geminiPublicService.analyzeImage(base64Image, imageFile.mimetype)
    }
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(userId, {
        $set: { [`imageAnalysisUsage.${monthKey}`]: monthlyUsage + 1 }
      })
    }
    
    res.json({
      success: true,
      data: {
        analysis: result,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Image analysis error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to analyze image' })
  }
})

// GET /api/ai/analyze-image/usage - Check image analysis usage
router.get('/analyze-image/usage', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const user = await User.findById(userId).select('imageAnalysisUsage isPremium username').lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`
    
    const usage = (user as any).imageAnalysisUsage || {}
    const monthlyUsage = usage[monthKey] || 0
    const monthlyLimit = user.isPremium ? 100 : 10
    const isUnlimited = user.username === 'AkDavid'
    const remainingUsage = isUnlimited ? 999999 : monthlyLimit - monthlyUsage
    
    res.json({
      success: true,
      data: { 
        used: isUnlimited ? 0 : monthlyUsage,
        limit: isUnlimited ? 999999 : monthlyLimit,
        remaining: remainingUsage,
        isPremium: user.isPremium || isUnlimited
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Usage check error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to check usage' })
  }
})

// POST /api/ai/enhance-text - Enhance text using Gemini
router.post('/enhance-text', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { content, action } = req.body
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Content is required' })
    }

    if (!action || !['professional', 'funny', 'casual', 'hashtags'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`
    
    const usage = user.summaryUsage || {}
    const monthlyUsage = usage[monthKey] || 0
    const monthlyLimit = user.isPremium ? 100 : 5
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return res.status(429).json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} enhancements reached.`
      })
    }

    let enhanced: string
    switch (action) {
      case 'professional':
        enhanced = await geminiPublicService.enhanceText(content, 'Rewrite this in a professional, formal tone suitable for business communication')
        break
      case 'funny':
        enhanced = await geminiPublicService.enhanceText(content, 'Rewrite this in a funny, humorous tone while keeping the main message')
        break
      case 'casual':
        enhanced = await geminiPublicService.enhanceText(content, 'Rewrite this in a casual, friendly tone')
        break
      case 'hashtags':
        enhanced = await geminiPublicService.enhanceText(content, 'Add 3-5 relevant hashtags at the end of this text. Keep the original text and just append hashtags')
        break
      default:
        enhanced = content
    }
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(userId, {
        $set: { [`summaryUsage.${monthKey}`]: monthlyUsage + 1 }
      })
    }
    
    res.json({
      success: true,
      data: {
        enhanced,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Text enhancement error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to enhance text' })
  }
})

// POST /api/ai/transcribe - Transcribe audio using Gemini 2.0
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const audioFile = req.file
    if (!audioFile) {
      return res.status(400).json({ success: false, message: 'Audio file is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`
    
    const usage = user.transcriptionUsage || {}
    const monthlyUsage = usage[monthKey] || 0
    const monthlyLimit = user.isPremium ? 100 : 10
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return res.status(429).json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} transcriptions reached.`
      })
    }

    const base64Audio = audioFile.buffer.toString('base64')
    const transcription = await geminiPublicService.transcribeAudio(base64Audio, audioFile.mimetype)
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(userId, {
        $set: { [`transcriptionUsage.${monthKey}`]: monthlyUsage + 1 }
      })
    }
    
    res.json({
      success: true,
      data: {
        transcription,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Transcription error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' })
  }
})

// GET /api/ai/transcribe/usage - Check transcription usage
router.get('/transcribe/usage', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const user = await User.findById(userId).select('transcriptionUsage isPremium username').lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`
    
    const usage = (user as any).transcriptionUsage || {}
    const monthlyUsage = usage[monthKey] || 0
    const monthlyLimit = user.isPremium ? 100 : 10
    const isUnlimited = user.username === 'AkDavid'
    const remainingUsage = isUnlimited ? 999999 : monthlyLimit - monthlyUsage
    
    res.json({
      success: true,
      data: { 
        used: isUnlimited ? 0 : monthlyUsage,
        limit: isUnlimited ? 999999 : monthlyLimit,
        remaining: remainingUsage,
        isPremium: user.isPremium || isUnlimited
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Usage check error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to check usage' })
  }
})

export default router

