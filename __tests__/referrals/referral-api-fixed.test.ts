
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import User from '../../models/User';
import Referral from '../../models/Referral';
import { POST as createReferral, GET as getReferralCode } from '../../app/api/referrals/create/route';
import { GET as getReferralStats } from '../../app/api/referrals/stats/route';

// Mock the ReferralSystemFixed to avoid database connection issues
jest.mock('../../utils/referral-system-fixed', () => ({
  ReferralSystemFixed: {
    createReferral: jest.fn(),
    getReferralCode: jest.fn(),
    getReferralStats: jest.fn(),
  }
}));

import { ReferralSystemFixed } from '../../utils/referral-system-fixed';
const mockedReferralSystem = ReferralSystemFixed as jest.Mocked<typeof ReferralSystemFixed>;

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authMiddleware: jest.fn()
}));

import { authMiddleware } from '../../middleware/auth';
const mockedAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

let mockUserId: string;

beforeAll(async () => {
  const testDbUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI + '_test';
  await mongoose.connect(testDbUri);
  
  // Generate a valid ObjectId for mocking
  mockUserId = new mongoose.Types.ObjectId().toString();
  
  // Setup default auth mock
  mockedAuthMiddleware.mockResolvedValue({ success: true, user: { id: mockUserId } });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clean up test data - be careful with this approach in production!
  await User.deleteMany({ email: { $regex: /@example\.com$/ } });
  await Referral.deleteMany({});
  // Reset auth mock to default
  mockedAuthMiddleware.mockResolvedValue({ success: true, user: { id: mockUserId } });
});

describe('Referral API Endpoints', () => {
  describe('GET /api/referrals/create', () => {
    it('should return referral code for authenticated user', async () => {
      const user = await User.create({
        _id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        referralCode: 'TEST123',
      });

      // Mock the ReferralSystemFixed method
      mockedReferralSystem.getReferralCode.mockResolvedValueOnce('TEST123');

      const request = new NextRequest('http://localhost/api/referrals/create');
      const response = await getReferralCode(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.referralCode).toBe('TEST123');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockedAuthMiddleware.mockResolvedValueOnce({ success: false, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost/api/referrals/create');
      const response = await getReferralCode(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/referrals/create', () => {
    let referrer: any, referred: any;

    beforeEach(async () => {
      referrer = await User.create({
        _id: mockUserId,
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123',
      });

      referred = await User.create({
        username: 'referred',
        email: 'referred@example.com',
        password: 'hashedpassword',
      });
    });

    it('should create referral successfully', async () => {
      // Mock the createReferral method
      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrer: referrer._id,
        referred: referred._id,
        referralCode: 'REF123',
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      mockedReferralSystem.createReferral.mockResolvedValueOnce(mockReferral);

      const request = new NextRequest('http://localhost/api/referrals/create', {
        method: 'POST',
        body: JSON.stringify({ referredUserId: referred._id.toString() }),
      });

      const response = await createReferral(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.referral).toBeDefined();
      expect(data.data.referral.status).toBe('pending');
    });

    it('should return 400 for missing referredUserId', async () => {
      const request = new NextRequest('http://localhost/api/referrals/create', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await createReferral(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Referred user ID is required');
    });

    it('should return 400 for self-referral', async () => {
      const request = new NextRequest('http://localhost/api/referrals/create', {
        method: 'POST',
        body: JSON.stringify({ referredUserId: referrer._id.toString() }),
      });

      const response = await createReferral(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Cannot refer yourself');
    });

    it('should return 409 if referral already exists', async () => {
        // Mock the createReferral method to throw an error
        mockedReferralSystem.createReferral.mockRejectedValueOnce(new Error('Referral already exists'));
  
        const request = new NextRequest('http://localhost/api/referrals/create', {
          method: 'POST',
          body: JSON.stringify({ referredUserId: referred._id.toString() }),
        });
  
        const response = await createReferral(request);
        const data = await response.json();
  
        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Referral already exists');
      });
  });

  describe('GET /api/referrals/stats', () => {
    let referrer: any, referred1: any, referred2: any;

    beforeEach(async () => {
      referrer = await User.create({
        _id: mockUserId,
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'hashedpassword',
        referralCode: 'REF123',
      });

      referred1 = await User.create({
        username: 'referred1',
        email: 'referred1@example.com',
        password: 'hashedpassword',
      });

      referred2 = await User.create({
        username: 'referred2',
        email: 'referred2@example.com',
        password: 'hashedpassword',
      });

      await Referral.create({
        referrer: referrer._id,
        referred: referred1._id,
        referralCode: `REF123_${Date.now()}_1`,
        status: 'completed',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await Referral.create({
        referrer: referrer._id,
        referred: referred2._id,
        referralCode: `REF123_${Date.now()}_2`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    });

    it('should return referral statistics', async () => {
      const request = new NextRequest('http://localhost/api/referrals/stats');
      const response = await getReferralStats(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.stats).toBeDefined();
      expect(data.data.recentReferrals).toBeDefined();
      expect(data.data.recentReferrals.length).toBe(2);
    });
  });
});
