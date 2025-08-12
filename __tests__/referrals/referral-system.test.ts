import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../../models/User'
import Referral from '../../models/Referral'
import UserStats from '../../models/UserStats'
import { ReferralSystem } from '../../utils/referral-system'
import { awardXP } from '../../utils/awardXP'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  // Clean up database before each test
  await User.deleteMany({})
  await Referral.deleteMany({})
  await UserStats.deleteMany({})
})

describe('ReferralSystem', () => {
  describe('getReferralCode', () => {
    it('should return existing referral code', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        referralCode: 'EXISTING123'
      })

      const code = await ReferralSystem.getReferralCode(user._id.toString())
      expect(code).toBe('EXISTING123')
    })

    it('should generate referral code if missing', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword'
      })

      // Remove referral code to simulate old user
      await User.findByIdAndUpdate(user._id, { $unset: { referralCode: 1 } })

      const code = await ReferralSystem.getReferralCode(user._id.toString())
      expect(code).toBeDefined()
      expect(code).toMatch(/^TEST[A-Z0-9]+$/) // Should start with first 4 chars of username
    })

    it('should throw error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()
      await expect(ReferralSystem.getReferralCode(fakeId)).rejects.toThrow('User not found')
    })
  })

  describe('createReferral', () => {
    let referrer: any, referred: any

    beforeEach(async () => {
      referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123'
      })

      referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword'
      })
    })

    it('should create a new referral successfully', async () => {
      const referral = await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )

      expect(referral).toBeDefined()
      expect(referral.referrer.toString()).toBe(referrer._id.toString())
      expect(referral.referred.toString()).toBe(referred._id.toString())
      expect(referral.referralCode).toBe('REF123')
      expect(referral.status).toBe('pending')
      expect(referral.expiresAt).toBeInstanceOf(Date)
    })

    it('should throw error for duplicate referral', async () => {
      await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )

      await expect(
        ReferralSystem.createReferral(
          referrer._id.toString(),
          referred._id.toString()
        )
      ).rejects.toThrow('Referral already exists')
    })

    it('should set expiration date 30 days from now', async () => {
      const referral = await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )

      const expectedExpiry = new Date()
      expectedExpiry.setDate(expectedExpiry.getDate() + 30)
      
      const timeDiff = Math.abs(referral.expiresAt.getTime() - expectedExpiry.getTime())
      expect(timeDiff).toBeLessThan(1000) // Within 1 second
    })
  })

  describe('checkReferralCompletion', () => {
    let referrer: any, referred: any, referral: any

    beforeEach(async () => {
      referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123',
        points: 100
      })

      referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword',
        points: 10
      })

      referral = await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )

      // Create UserStats for referred user
      await UserStats.create({
        user: referred._id,
        totalPosts: 0,
        totalXP: 10,
        totalReferrals: 0
      })
    })

    it('should complete referral when user meets criteria', async () => {
      // Update user stats to meet completion criteria
      await UserStats.findOneAndUpdate(
        { user: referred._id },
        { totalPosts: 1, totalXP: 60 }
      )

      await ReferralSystem.checkReferralCompletion(referred._id.toString())

      const updatedReferral = await Referral.findById(referral._id)
      expect(updatedReferral?.status).toBe('completed')
      expect(updatedReferral?.completedAt).toBeInstanceOf(Date)
      expect(updatedReferral?.rewardsClaimed).toBe(true)

      // Check XP was awarded
      const updatedReferrer = await User.findById(referrer._id)
      const updatedReferred = await User.findById(referred._id)
      
      expect(updatedReferrer?.points).toBeGreaterThan(100) // Should have bonus XP
      expect(updatedReferred?.points).toBeGreaterThan(10) // Should have bonus XP
    })

    it('should not complete referral when user does not meet criteria', async () => {
      // User has posts but not enough XP
      await UserStats.findOneAndUpdate(
        { user: referred._id },
        { totalPosts: 1, totalXP: 30 }
      )

      await ReferralSystem.checkReferralCompletion(referred._id.toString())

      const updatedReferral = await Referral.findById(referral._id)
      expect(updatedReferral?.status).toBe('pending')
    })

    it('should handle missing UserStats gracefully', async () => {
      // Delete UserStats
      await UserStats.deleteOne({ user: referred._id })

      await expect(
        ReferralSystem.checkReferralCompletion(referred._id.toString())
      ).not.toThrow()

      const updatedReferral = await Referral.findById(referral._id)
      expect(updatedReferral?.status).toBe('pending')
    })
  })

  describe('getReferralStats', () => {
    let referrer: any, referred1: any, referred2: any

    beforeEach(async () => {
      referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123'
      })

      referred1 = await User.create({
        username: 'referred1',
        email: 'referred1@example.com',
        password: 'hashedpassword'
      })

      referred2 = await User.create({
        username: 'referred2',
        email: 'referred2@example.com',
        password: 'hashedpassword'
      })

      // Create referrals
      await Referral.create({
        referrer: referrer._id,
        referred: referred1._id,
        referralCode: 'REF123',
        status: 'completed',
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        referrerReward: 25
      })

      await Referral.create({
        referrer: referrer._id,
        referred: referred2._id,
        referralCode: 'REF123',
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        referrerReward: 25
      })
    })

    it('should return correct referral statistics', async () => {
      const stats = await ReferralSystem.getReferralStats(referrer._id.toString())

      expect(stats).toBeDefined()
      expect(stats.stats).toBeDefined()
      expect(stats.recentReferrals).toBeDefined()

      // Check stats structure
      expect(stats.stats.completed?.count).toBe(1)
      expect(stats.stats.completed?.rewards).toBe(25)
      expect(stats.stats.pending?.count).toBe(1)
      expect(stats.stats.pending?.rewards).toBe(25)

      // Check recent referrals
      expect(stats.recentReferrals).toHaveLength(2)
    })

    it('should handle user with no referrals', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedpassword'
      })

      const stats = await ReferralSystem.getReferralStats(newUser._id.toString())

      expect(stats.stats).toEqual({})
      expect(stats.recentReferrals).toHaveLength(0)
    })
  })

  describe('expireOldReferrals', () => {
    it('should expire old pending referrals', async () => {
      const referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123'
      })

      const referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword'
      })

      // Create expired referral
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      await Referral.create({
        referrer: referrer._id,
        referred: referred._id,
        referralCode: 'REF123',
        status: 'pending',
        expiresAt: expiredDate
      })

      await ReferralSystem.expireOldReferrals()

      const expiredReferral = await Referral.findOne({
        referrer: referrer._id,
        referred: referred._id
      })

      expect(expiredReferral?.status).toBe('expired')
    })

    it('should not expire non-expired referrals', async () => {
      const referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123'
      })

      const referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword'
      })

      // Create non-expired referral
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      await Referral.create({
        referrer: referrer._id,
        referred: referred._id,
        referralCode: 'REF123',
        status: 'pending',
        expiresAt: futureDate
      })

      await ReferralSystem.expireOldReferrals()

      const referral = await Referral.findOne({
        referrer: referrer._id,
        referred: referred._id
      })

      expect(referral?.status).toBe('pending')
    })
  })

  describe('Integration with XP System', () => {
    let referrer: any, referred: any

    beforeEach(async () => {
      referrer = await User.create({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123',
        points: 100
      })

      referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword',
        points: 10
      })

      await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )

      // Create UserStats
      await UserStats.create({
        user: referred._id,
        totalPosts: 0,
        totalXP: 10,
        totalReferrals: 0
      })
    })

    it('should complete referral when user gains XP through posts', async () => {
      // Simulate user creating posts and gaining XP
      await UserStats.findOneAndUpdate(
        { user: referred._id },
        { $inc: { totalPosts: 1, totalXP: 50 } }
      )

      // Award XP which should trigger referral check
      await awardXP(referred._id.toString(), 'post_creation')

      const referral = await Referral.findOne({
        referrer: referrer._id,
        referred: referred._id
      })

      expect(referral?.status).toBe('completed')
    })
  })
})