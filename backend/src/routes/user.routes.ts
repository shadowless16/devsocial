import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { User, Follow, Post } from '../models'
import bcrypt from 'bcryptjs'
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

// GET /profile - Get current user profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, data: { user } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Profile fetch error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// PUT /profile - Update current user profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const {
      firstName, lastName, displayName, bio, affiliation, location, website, avatar, bannerUrl,
      currentPassword, newPassword
    } = req.body

    const user = await User.findById(userId).select('+password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const updateData: any = {}
    let earnedXP = 0
    let earnedBadge = null

    // Helper for avatar normalization
    const normalizeAvatar = (a?: string | null): string | undefined => {
      if (!a) return undefined
      let url = String(a).trim()
      url = url.replace(/^['"]+|['"]+$/g, '')
      if (url.includes('models.readyplayer.me')) {
        const baseUrl = url.split('?')[0]
        return baseUrl.replace(/\.glb$/i, '.png')
      }
      return url
    }

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (displayName !== undefined) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio
    if (affiliation !== undefined) updateData.affiliation = affiliation
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website
    if (avatar !== undefined) {
      updateData.avatar = normalizeAvatar(avatar)
      const isFirstCustomAvatar = avatar && (!user.avatar || user.isGenerated) && !avatar.includes('dicebear') && !avatar.includes('placeholder')
      if (isFirstCustomAvatar) {
        updateData.isGenerated = false
        earnedXP = 50
        earnedBadge = 'first_impression'
        if (!user.badges.includes('first_impression')) {
          updateData.badges = [...user.badges, 'first_impression']
        }
        updateData.points = (user.points || 0) + earnedXP
      }
    }
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password!)
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' })
      }
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')

    res.json({
      success: true,
      data: { 
        user: updatedUser, 
        message: 'Profile updated successfully',
        reward: earnedXP > 0 ? {
          xp: earnedXP,
          badge: earnedBadge,
          message: '🎉 First Impression badge earned! +50 XP'
        } : null
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Internal server error'
    console.error('Profile update error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /search - Search for users
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q?.toString()
    const limit = parseInt(req.query.limit?.toString() || '10')
    const currentUserId = (req as any).user?.id // Optional auth

    if (!query || query.length < 1) {
      if (currentUserId) {
        const followedUsers = await Follow.find({ follower: currentUserId })
          .populate('following', 'username displayName avatar')
          .limit(limit)
          .sort({ createdAt: -1 })
        
        const users = followedUsers.map(f => f.following)
        return res.json({ users })
      }
      return res.json({ users: [] })
    }

    let users: any[] = []
    
    if (currentUserId) {
      const followedUsers = await Follow.find({ follower: currentUserId })
        .populate({
          path: 'following',
          match: {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { displayName: { $regex: query, $options: 'i' } }
            ]
          },
          select: 'username displayName avatar'
        })
        .limit(limit)
      
      const followedMatches = followedUsers
        .map(f => f.following)
        .filter(user => user !== null)
      
      users.push(...followedMatches)
      
      const remainingLimit = limit - users.length
      if (remainingLimit > 0) {
        const followedUserIds = followedMatches.map(u => u._id)
        const otherUsers = await User.find({
          _id: { $nin: [...followedUserIds, currentUserId] },
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { displayName: { $regex: query, $options: 'i' } }
          ]
        })
        .select('username displayName avatar')
        .limit(remainingLimit)
        .sort({ username: 1 })
        
        users.push(...otherUsers)
      }
    } else {
      users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { displayName: { $regex: query, $options: 'i' } }
        ]
      })
      .select('username displayName avatar')
      .limit(limit)
      .sort({ username: 1 })
    }

    res.json({ users })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Search users error:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// GET /:username - Get user profile by username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const type = req.query.type?.toString() || 'profile'
    const currentUserId = (req as any).user?.id // Optional auth

    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).select('-password -email').lean() as any

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const [
      postsCount,
      followersCount,
      followingCount,
      totalLikes,
      totalComments
    ] = await Promise.all([
      Post.countDocuments({ author: user._id }),
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
      Post.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
      ]).then(result => result[0]?.totalLikes || 0),
      Post.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, totalComments: { $sum: '$commentsCount' } } }
      ]).then(result => result[0]?.totalComments || 0)
    ])

    if (type === 'stats') {
      return res.json({
        success: true,
        data: {
          totalPosts: postsCount,
          totalLikes,
          totalFollowers: followersCount,
          totalFollowing: followingCount,
          level: user.level || 1,
          xp: user.points || 0,
          badges: user.badges || []
        }
      })
    }

    const recentPosts = await Post.find({ author: user._id })
      .populate('author', 'username displayName avatar level')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    const transformedPosts = (recentPosts as any[]).map((post) => ({
      ...post,
      _id: post._id.toString(),
      id: post._id.toString(),
      isLiked: currentUserId ? post.likes?.some((id: any) => id.toString() === currentUserId) : false,
      likesCount: post.likesCount || post.likes?.length || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: new Date(post.createdAt).toISOString()
    }))

    if (type === 'activity') {
      return res.json({
        success: true,
        data: { posts: transformedPosts }
      })
    }

    let isFollowing = false
    if (currentUserId && currentUserId !== user._id.toString()) {
      const followExists = await Follow.findOne({
        follower: currentUserId,
        following: user._id
      })
      isFollowing = !!followExists
    }

    const userRank = await User.countDocuments({ points: { $gt: user.points || 0 } }) + 1
    const getRankTitle = (level: number) => {
      if (level >= 50) return 'Legend'
      if (level >= 40) return 'Master'
      if (level >= 30) return 'Expert'
      if (level >= 20) return 'Advanced'
      if (level >= 10) return 'Intermediate'
      if (level >= 5) return 'Beginner'
      return 'Novice'
    }

    const userProfile = {
      ...user,
      _id: user._id.toString(),
      displayName: user.displayName || user.username,
      bio: user.bio || '',
      affiliation: user.affiliation || user.branch || 'Not specified',
      avatar: user.avatar || '/placeholder.svg',
      followersCount,
      followingCount,
      isFollowing,
      rank: userRank,
      rankTitle: getRankTitle(user.level || 1),
      stats: { totalPosts: postsCount, totalComments, totalLikes },
      recentPosts: transformedPosts
    }

    res.json({ success: true, data: { user: userProfile } })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching user profile:', errorMessage)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
