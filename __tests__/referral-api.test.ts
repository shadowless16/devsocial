import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../models/User'
import Referral from '../models/Referral'
import UserStats from '../models/UserStats'
import { POST as createReferral, GET as getReferralCode } from '../app/api/referrals/create/route'
import { GET as getReferralStats } from '../app/api/referrals/stats/route'

let mongoServer: MongoMemoryServer

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: jest.fn().mockImplementation(async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' }
    }
    
    // Mock user ID from token
    const userId = authHeader.replace('Bearer ', '')
    return {
      success: true,
      user: { id: userId }
    }
  })
}))

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
  await User.deleteMany({})
  await Referral.deleteMany({})
  await UserStats.deleteMany({})
})

describe('Referral API Endpoints', () => {
  describe('GET /api/referrals/create', () => {
    it('should return referral code for authenticated user', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        referralCode: 'TEST123'
      })

      const request = new NextRequest('http://localhost:3000/api/referrals/create', {
        headers: {
          'authorization': `Bearer ${user._id.toString()}`
        }
      })

      const response = await getReferralCode(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.referralCode).toBe('TEST123')
    })

    it('should return 401 for unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3000/api/referrals/create')

      const response = await getReferralCode(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/referrals/create', () => {
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

    it('should create referral successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/referrals/create', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${referrer._id.toString()}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          referredUserId: referred._id.toString()
        })
      })

      const response = await createReferral(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.referral).toBeDefined()
      expect(data.data.referral.status).toBe('pending')
    })

    it('should return 400 for missing referredUserId', async () => {
      const request = new NextRequest('http://localhost:3000/api/referrals/create', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${referrer._id.toString()}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const response = await createReferral(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Referred user ID is required')
    })

    it('should return 400 for self-referral', async () => {
      const request = new NextRequest('http://localhost:3000/api/referrals/create', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${referrer._id.toString()}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          referredUserId: referrer._id.toString()
        })
      })

      const response = await createReferral(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Cannot refer yourself')
    })
  })

  describe('GET /api/referrals/stats', () => {
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

      // Create test referrals
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

    it('should return referral statistics', async () => {
      const request = new NextRequest('http://localhost:3000/api/referrals/stats', {
        headers: {
          'authorization': `Bearer ${referrer._id.toString()}`
        }
      })

      const response = await getReferralStats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.stats).toBeDefined()
      expect(data.data.recentReferrals).toBeDefined()
      expect(data.data.recentReferrals).toHaveLength(2)
    })

    it('should return empty stats for user with no referrals', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedpassword'
      })

      const request = new NextRequest('http://localhost:3000/api/referrals/stats', {
        headers: {
          'authorization': `Bearer ${newUser._id.toString()}`
        }
      })

      const response = await getReferralStats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.stats).toEqual({})
      expect(data.data.recentReferrals).toHaveLength(0)
    })
  })
})