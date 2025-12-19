import { Router } from 'express'
import Post from '../models/Post'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { limit = 20, skip = 0, author } = req.query
    const query: any = {}
    if (author) {
      query.author = author
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
    res.json({ success: true, data: posts })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts' })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content, images, tags } = req.body
    const post = await Post.create({ author: req.user!.id, content, images, tags })
    res.json({ success: true, data: post })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create post' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar')
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
    res.json({ success: true, data: post })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch post' })
  }
})

export default router
