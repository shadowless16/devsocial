import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { KnowledgeEntry, User } from '../models'
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

// GET /api/knowledge-bank/ - Fetch knowledge entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const technology = req.query.technology?.toString()
    const search = req.query.search?.toString()
    const page = parseInt(req.query.page?.toString() || '1')
    const limit = parseInt(req.query.limit?.toString() || '20')

    const query: Record<string, any> = {}
    if (technology && technology !== 'All') {
      query.technology = technology
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const userId = req.user?.id

    // Fetch entries with pagination
    const entries = await KnowledgeEntry.find(query)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 } as any)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Add isLiked field for authenticated users
    const entriesWithLikes = entries.map(entry => ({
      ...entry,
      likes: entry.likes.length,
      isLiked: userId ? entry.likes.some((likeId: any) => likeId.toString() === userId) : false
    }))

    const total = await KnowledgeEntry.countDocuments(query)

    res.json({
      success: true,
      entries: entriesWithLikes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching knowledge entries:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries'
    })
  }
})

// POST /api/knowledge-bank/ - Create new knowledge entry
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { title, technology, category, content, codeExample, tags } = req.body

    // Validation
    if (!title || !technology || !category || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Create entry
    const entry = await KnowledgeEntry.create({
      title,
      technology,
      category,
      content,
      codeExample: codeExample || undefined,
      tags: tags || [],
      author: new mongoose.Types.ObjectId(userId)
    })

    // Populate author info
    await entry.populate('author', 'username profilePicture')

    // Award XP/Points to user
    await User.findByIdAndUpdate(userId, {
      $inc: { points: 15 } // 15 XP for creating knowledge entry
    })

    res.json({
      success: true,
      entry: {
        ...entry.toObject(),
        likes: 0,
        isLiked: false
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error creating knowledge entry:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to create entry'
    })
  }
})

// GET /api/knowledge-bank/:id - Get single entry
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const entry = await KnowledgeEntry.findById(id)
      .populate('author', 'username profilePicture')
      .lean()

    if (!entry) {
      return res.status(444).json({
        success: false,
        message: 'Knowledge entry not found'
      })
    }

    const entryWithLikes = {
      ...entry,
      likes: entry.likes.length,
      isLiked: userId ? entry.likes.some((likeId: any) => likeId.toString() === userId) : false
    }

    res.json({
      success: true,
      entry: entryWithLikes
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching knowledge entry:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entry'
    })
  }
})

// POST /api/knowledge-bank/:id/like - Like/unlike knowledge entry
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { id } = req.params
    const userObjectId = new mongoose.Types.ObjectId(userId)

    const entry = await KnowledgeEntry.findById(id)
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Knowledge entry not found' })
    }

    const isLiked = entry.likes.some(likeId => likeId.toString() === userId)

    if (isLiked) {
      // Unlike
      entry.likes = entry.likes.filter(likeId => likeId.toString() !== userId)
    } else {
      // Like
      entry.likes.push(userObjectId)
      
      // Award XP to entry author (but not if liking own entry)
      if (entry.author.toString() !== userId) {
        await User.findByIdAndUpdate(entry.author, {
          $inc: { points: 2 } // 2 XP for receiving a like
        })
      }
    }

    await entry.save()

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: entry.likes.length
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error toggling like:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    })
  }
})

export default router

