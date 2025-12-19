import { Router } from 'express'
import Notification from '../models/Notification'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { unread, limit = 20 } = req.query
    const query: any = { userId: req.user!.id }
    if (unread === 'true') query.read = false
    
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Notification.countDocuments({ userId: req.user!.id, read: false })
    ])
    
    res.json({ 
      success: true, 
      data: { 
        notifications, 
        unreadCount 
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/mark-read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { notificationId, notificationIds } = req.body
    const ids = notificationIds || [notificationId]
    
    await Notification.updateMany(
      { _id: { $in: ids }, userId: req.user!.id },
      { read: true }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Support PUT too (for frontend compatibility)
router.put('/mark-read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { notificationIds } = req.body
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId: req.user!.id },
      { read: true }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/mark-all-read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Stubs for push notifications to prevent 404s
router.post('/subscribe', authMiddleware, async (req: AuthRequest, res) => {
  res.json({ success: true, message: 'Push notifications not yet implemented in backend' })
})

router.post('/unsubscribe', authMiddleware, async (req: AuthRequest, res) => {
  res.json({ success: true })
})

export default router
