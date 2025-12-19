import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { User, Follow, Notification, Activity, MissionProgress } from '../models'
import { awardXP, XP_VALUES } from '../utils/awardXP'
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

// POST /:userId - Follow a user
router.post('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user?.id

    if (!userId || !currentUserId) {
      return res.status(400).json({ success: false, message: 'Invalid user IDs' })
    }

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' })
    }

    const userToFollow = await User.findById(userId)
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userId,
    })

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following this user' })
    }

    let isNewFollow = false
    try {
      await Follow.create({
        follower: currentUserId,
        following: userId,
      })
      isNewFollow = true
    } catch (createError: any) {
      if (createError.code === 11000) {
        return res.status(400).json({ success: false, message: 'Already following this user' })
      }
      throw createError
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } })

    // Create a notification
    await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: 'follow',
      title: 'New Follower',
      message: `${req.user?.displayName || req.user?.username} started following you`,
    })

    // Create an activity record
    await Activity.create({
      user: currentUserId,
      type: 'user_followed',
      description: `Started following ${userToFollow.displayName || userToFollow.username}`,
      metadata: { followedUserId: userId },
      xpEarned: XP_VALUES.user_followed,
    })

    // Award XP
    if (isNewFollow) {
      await awardXP(currentUserId, 'user_followed', userId)
    }

    // Track mission progress
    try {
      const activeMissions = await MissionProgress.find({
        user: currentUserId,
        status: 'active'
      }).populate('mission')

      for (const progress of activeMissions) {
        if (!progress.mission) continue
        
        const mission = progress.mission as any
        let progressUpdated = false
        
        for (const step of mission.steps || []) {
          const stepId = step.id || step._id?.toString()
          
          if (stepId && !progress.stepsCompleted.includes(stepId)) {
            const stepText = ((step.title || '') + ' ' + (step.description || '')).toLowerCase()
            const hasFollow = stepText.includes('follow')
            const hasUser = stepText.includes('user') || stepText.includes('developer')
            
            if (hasFollow && hasUser) {
              const userFollowCount = await Follow.countDocuments({ follower: currentUserId })
              if (userFollowCount >= (step.target || 1)) {
                progress.stepsCompleted.push(stepId)
                progressUpdated = true
              }
            }
          }
        }
        
        if (progress.stepsCompleted.length >= (mission.steps?.length || 0) && progress.status !== 'completed') {
          progress.status = 'completed'
          progress.completedAt = new Date()
          progress.xpEarned = mission.rewards?.xp || 0
          progressUpdated = true
        }
        
        if (progressUpdated) {
          await progress.save()
        }
      }
    } catch (missionError) {
      console.error('Mission progress tracking error:', missionError)
    }

    res.json({ success: true, message: 'Followed successfully' })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Follow user error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// DELETE /:userId - Unfollow a user
router.delete('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user?.id

    if (!userId || !currentUserId) {
      return res.status(400).json({ success: false, message: 'Invalid user IDs' })
    }

    const userToUnfollow = await User.findById(userId)
    if (userToUnfollow?.username === 'AkDavid') {
      return res.status(403).json({ success: false, message: 'Cannot unfollow the platform creator' })
    }

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    })

    if (!follow) {
      return res.status(400).json({ success: false, message: 'Not following this user' })
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } })

    res.json({ success: true, message: 'Unfollowed successfully' })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Unfollow user error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
