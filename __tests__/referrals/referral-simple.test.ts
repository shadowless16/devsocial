import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import User from '../../models/User'
import Referral from '../../models/Referral'
import UserStats from '../../models/UserStats'
import { ReferralSystem } from '../../utils/referral-system'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables')
  }
  await mongoose.connect(process.env.MONGODB_URI)
}, 60000)

afterAll(async () => {
  await mongoose.disconnect()
}, 10000)

beforeEach(async () => {
  // Clean up test data
  await User.deleteMany({ username: { $regex: /^test/ } })
  await Referral.deleteMany({})
  await UserStats.deleteMany({})
})

describe('Referral System - Simple Tests', () => {
  it('should create and complete a referral successfully', async () => {
    // Create referrer
    const referrer = await User.create({
      username: 'testreferrer',
      email: 'referrer@test.com',
      password: 'hashedpassword',
      points: 100
    })

    // Create referred user
    const referred = await User.create({
      username: 'testreferred',
      email: 'referred@test.com',
      password: 'hashedpassword',
      points: 10
    })

    // Create referral
    const referral = await ReferralSystem.createReferral(
      referrer._id.toString(),
      referred._id.toString()
    )

    expect(referral.status).toBe('pending')
    expect(referral.referrer.toString()).toBe(referrer._id.toString())
    expect(referral.referred.toString()).toBe(referred._id.toString())

    // Create UserStats that meet completion criteria
    await UserStats.create({
      user: referred._id,
      totalPosts: 1,
      totalXP: 60
    })

    // Check referral completion
    await ReferralSystem.checkReferralCompletion(referred._id.toString())

    // Verify completion
    const updatedReferral = await Referral.findById(referral._id)
    expect(updatedReferral?.status).toBe('completed')
    expect(updatedReferral?.rewardsClaimed).toBe(true)

    // Verify XP was awarded
    const updatedReferrer = await User.findById(referrer._id)
    const updatedReferred = await User.findById(referred._id)
    
    expect(updatedReferrer?.points).toBeGreaterThan(100)
    expect(updatedReferred?.points).toBeGreaterThan(10)
  }, 30000)

  it('should prevent duplicate referrals', async () => {
    const referrer = await User.create({
      username: 'testreferrer2',
      email: 'referrer2@test.com',
      password: 'hashedpassword'
    })

    const referred = await User.create({
      username: 'testreferred2',
      email: 'referred2@test.com',
      password: 'hashedpassword'
    })

    // Create first referral
    await ReferralSystem.createReferral(
      referrer._id.toString(),
      referred._id.toString()
    )

    // Try to create duplicate
    await expect(
      ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )
    ).rejects.toThrow('Referral already exists')
  }, 15000)

  it('should get referral statistics correctly', async () => {
    const referrer = await User.create({
      username: 'testreferrer3',
      email: 'referrer3@test.com',
      password: 'hashedpassword'
    })

    const referred = await User.create({
      username: 'testreferred3',
      email: 'referred3@test.com',
      password: 'hashedpassword'
    })

    // Create completed referral
    await Referral.create({
      referrer: referrer._id,
      referred: referred._id,
      referralCode: referrer.referralCode,
      status: 'completed',
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      referrerReward: 25
    })

    const stats = await ReferralSystem.getReferralStats(referrer._id.toString())

    expect(stats.stats.completed?.count).toBe(1)
    expect(stats.stats.completed?.rewards).toBe(25)
    expect(stats.recentReferrals).toHaveLength(1)
  }, 15000)
})