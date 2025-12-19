import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { connectDB } from './config/database'
import { initWebSocket } from './utils/websocket-server'

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import likeRoutes from './routes/like.routes.js'
import gamificationRoutes from './routes/gamification.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import feedRoutes from './routes/feed.routes.js'
import searchRoutes from './routes/search.routes.js'
import tagsRoutes from './routes/tags.routes.js'
import trendingRoutes from './routes/trending.routes.js'
import profileRoutes from './routes/profile.routes.js'
import referralsRoutes from './routes/referrals.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import communitiesRoutes from './routes/communities.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import pollsRoutes from './routes/polls.routes.js'
import feedbackRoutes from './routes/feedback.routes.js'
import challengesRoutes from './routes/challenges.routes.js'
import careerPathsRoutes from './routes/career-paths.routes.js'
import knowledgeBankRoutes from './routes/knowledge-bank.routes.js'
import aiRoutes from './routes/ai.routes.js'
import adminRoutes from './routes/admin.routes.js'
import modRoutes from './routes/mod.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import cronRoutes from './routes/cron.routes.js'
import affiliationsRoutes from './routes/affiliations.routes.js'
import linkPreviewRoutes from './routes/link-preview.routes.js'
import saveAvatarRoutes from './routes/save-avatar.routes.js'
import xpOvertakesRoutes from './routes/xp-overtakes.routes.js'
import followRoutes from './routes/follow.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'devsocial-backend' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/tags', tagsRoutes)
app.use('/api/trending', trendingRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/referrals', referralsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/communities', communitiesRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/polls', pollsRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/challenges', challengesRoutes)
app.use('/api/career-paths', careerPathsRoutes)
app.use('/api/knowledge-bank', knowledgeBankRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/mod', modRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/cron', cronRoutes)
app.use('/api/affiliations', affiliationsRoutes)
app.use('/api/link-preview', linkPreviewRoutes)
app.use('/api/save-avatar', saveAvatarRoutes)
app.use('/api/xp-overtakes', xpOvertakesRoutes)
app.use('/api/users/follow', followRoutes)


// Initialize HTTP server
const server = http.createServer(app)

// Initialize WebSocket
initWebSocket(server)

// Start server
const startServer = async () => {
  try {
    await connectDB()
    server.listen(PORT, () => {
      console.log(`🚀 Backend API running on port ${PORT}`)
      console.log(`🔌 WebSocket server attached`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
