import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import Post from '../models/Post'
import User from '../models/User'
import mongoose from 'mongoose'

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

// POST /api/polls/vote - Vote on a poll
router.post('/vote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { postId, optionIds } = req.body

    if (!postId || !optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid request' })
    }

    const post = await Post.findById(postId)
    if (!post || !post.poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' })
    }

    if (post.poll.endsAt && new Date(post.poll.endsAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Poll has ended' })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)
    
    const hasVoted = post.poll.options.some((opt) => 
      opt.voters.some(voterId => voterId.equals(userObjectId))
    )
    
    if (hasVoted) {
      return res.status(400).json({ success: false, message: 'Already voted' })
    }

    const validOptionIds = post.poll.options.map((opt) => opt.id)
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id))
    if (invalidOptions.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid option IDs' })
    }

    if (!post.poll.settings.multipleChoice && optionIds.length > 1) {
      return res.status(400).json({ success: false, message: 'Single choice only' })
    }

    if (post.poll.settings.multipleChoice && post.poll.settings.maxChoices && optionIds.length > post.poll.settings.maxChoices) {
      return res.status(400).json({ success: false, message: 'Too many choices' })
    }

    post.poll.options = post.poll.options.map((opt) => {
      if (optionIds.includes(opt.id)) {
        return {
          ...opt,
          votes: opt.votes + 1,
          voters: [...opt.voters, userObjectId],
        }
      }
      return opt
    })

    post.poll.totalVotes += 1
    await post.save()

    // Award XP/Points
    await User.findByIdAndUpdate(userId, { $inc: { points: 5 } })

    res.json({
      success: true,
      data: { poll: post.poll, xpAwarded: 5 },
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Vote error:', errorMessage)
    res.status(500).json({ success: false, message: errorMessage })
  }
})

export default router

