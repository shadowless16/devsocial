import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import User from '@/models/User';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock the database connection
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

import { getServerSession } from 'next-auth';
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Growth Analytics API', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/analytics/growth');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if user does not have analytics role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'user' }
      } as any);
      
      const request = new NextRequest('http://localhost:3000/api/analytics/growth');
      const response = await GET(request);
      
      expect(response.status).toBe(403);
    });
  });

  describe('Growth Metrics Calculation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'admin' }
      } as any);
    });

    it('should calculate growth metrics with test data', async () => {
      // Create test users with different registration dates
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Users from current period (last 30 days)
      await User.create([
        { 
          username: 'user1', 
          email: 'user1@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'One',
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) 
        },
        { 
          username: 'user2', 
          email: 'user2@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Two',
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) 
        },
        { 
          username: 'user3', 
          email: 'user3@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Three',
          createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) 
        }
      ]);

      // Users from previous period (30-60 days ago)
      await User.create([
        { 
          username: 'user4', 
          email: 'user4@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Four',
          createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) 
        },
        { 
          username: 'user5', 
          email: 'user5@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Five',
          createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000) 
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/growth?days=30');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.summary).toBeDefined();
      expect(data.acquisitionChannels).toBeDefined();
      expect(data.trends).toBeDefined();
    });

    it('should handle empty database gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/growth?days=30');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.summary.currentGrowthRate).toBe(0);
      expect(data.acquisitionChannels).toEqual([]);
    });

    it('should calculate acquisition channels correctly', async () => {
      const now = new Date();
      
      // Create users with different registration sources
      await User.create([
        { 
          username: 'user1', 
          email: 'user1@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'One',
          registrationSource: 'direct', 
          createdAt: now 
        },
        { 
          username: 'user2', 
          email: 'user2@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Two',
          registrationSource: 'referral', 
          createdAt: now 
        },
        { 
          username: 'user3', 
          email: 'user3@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Three',
          registrationSource: 'social', 
          createdAt: now 
        },
        { 
          username: 'user4', 
          email: 'user4@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Four',
          registrationSource: 'direct', 
          createdAt: now 
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/growth?days=30');
      const response = await GET(request);
      
      const data = await response.json();
      const channels = data.acquisitionChannels;
      
      expect(channels).toHaveLength(3);
      expect(channels.find((c: any) => c.channel === 'direct')?.users).toBe(2);
      expect(channels.find((c: any) => c.channel === 'referral')?.users).toBe(1);
      expect(channels.find((c: any) => c.channel === 'social')?.users).toBe(1);
    });
  });
});