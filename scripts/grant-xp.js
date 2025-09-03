// scripts/grant-xp.js
// Usage: node scripts/grant-xp.js
// This script increments User.points and UserStats.totalXP for a given username

const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_TEST_URI
console.log('DEBUG: Using MONGODB_URI=', !!MONGODB_URI ? '[REDACTED]' : 'none')
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment; set it in .env.local or environment variables')
  process.exit(1)
}

const USERNAME = 'AkDavid'
const AMOUNT = 1585

async function main() {
  console.log('DEBUG: connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI, { maxPoolSize: 10 })
  console.log('DEBUG: connected')
  const db = mongoose.connection.db

  try {
    const usersCol = db.collection('users')
    const user = await usersCol.findOne({ username: USERNAME })
    if (!user) {
      console.error(`User not found: ${USERNAME}`)
      return process.exit(1)
    }

    console.log(`Found user ${user.username} (${user._id}). Current points: ${user.points || 0}`)

    // Increment user's points field (used in some UI places)
    const updatedUserRes = await usersCol.findOneAndUpdate(
      { _id: user._id },
      { $inc: { points: AMOUNT } },
      { returnDocument: 'after' }
    )

    console.log(`User.points updated -> ${updatedUserRes.value.points}`)

    const userStatsCol = db.collection('userstats')
    let stats = await userStatsCol.findOne({ user: user._id })

    if (!stats) {
      // create new stats doc
      const initial = {
        user: user._id,
        totalXP: AMOUNT,
        weeklyXP: AMOUNT,
        monthlyXP: AMOUNT,
        currentLevel: Math.floor(AMOUNT / 100) + 1,
        currentRank: 'tech_jjc',
        postsCount: 0,
        totalPosts: 0,
        commentsCount: 0,
        likesReceived: 0,
        likesGiven: 0,
        totalReferrals: 0,
        lastActiveAt: new Date(),
        maxPostLikes: 0,
        helpfulSolutions: 0,
        bugsReported: 0,
        loginStreak: 0,
        badgesEarned: [],
        challengesCompleted: 0,
        mentorshipSessions: 0,
        weeklyRank: 0,
        monthlyRank: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const insert = await userStatsCol.insertOne(initial)
      stats = initial
      console.log('Created new UserStats document')
    } else {
      const updatedStats = await userStatsCol.findOneAndUpdate(
        { user: user._id },
        { $inc: { totalXP: AMOUNT, weeklyXP: AMOUNT, monthlyXP: AMOUNT }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' }
      )
      stats = updatedStats.value
      // Recalculate currentLevel using same formula as GamificationService
      const newLevel = Math.floor(stats.totalXP / 100) + 1
      if (newLevel !== stats.currentLevel) {
        await userStatsCol.updateOne({ user: user._id }, { $set: { currentLevel: newLevel } })
        stats.currentLevel = newLevel
      }
      console.log(`UserStats updated -> totalXP: ${stats.totalXP}, currentLevel: ${stats.currentLevel}`)
    }

    // Insert an XP log entry in xplogs collection (bypass Mongoose model validation by using collection)
    const xpLogsCol = db.collection('xplogs')
    const log = {
      userId: user._id,
      type: 'moderator_action_bonus', // existing enum-like type
      xpAmount: AMOUNT,
      refId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await xpLogsCol.insertOne(log)
    console.log('Inserted XP log entry')

    console.log('Done — granted', AMOUNT, 'XP to', USERNAME)
  } catch (err) {
    console.error('Error during grant:', err && err.stack ? err.stack : err)
    process.exit(1)
  } finally {
    try {
      await mongoose.disconnect()
      console.log('DEBUG: disconnected')
    } catch (e) {
      console.warn('DEBUG: error during disconnect', e)
    }
  }
}

main()

