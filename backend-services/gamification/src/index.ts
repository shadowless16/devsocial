import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database'
import gamificationRoutes from './routes/gamification.routes'
import leaderboardRoutes from './routes/leaderboard.routes'
import challengeRoutes from './routes/challenge.routes'

dotenv.config()

const app = express()
const PORT = process.env.GAMIFICATION_PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gamification' })
})

// Routes
app.use('/api/gamification', gamificationRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/challenges', challengeRoutes)

// Start server
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Gamification service running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
