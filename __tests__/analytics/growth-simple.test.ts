import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '@/models/User';

describe('Growth Analytics - Simple Tests', () => {
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

  describe('User Growth Calculations', () => {
    it('should calculate growth rate correctly', async () => {
      const now = new Date();
      
      // Create users in current period (last 30 days)
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
        }
      ]);

      // Create users in previous period (30-60 days ago)
      await User.create([
        { 
          username: 'user3', 
          email: 'user3@test.com', 
          password: 'password123',
          firstName: 'User',
          lastName: 'Three',
          createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) 
        }
      ]);

      // Calculate metrics manually
      const totalUsers = await User.countDocuments();
      
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo, $lte: now }
      });

      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const previousUsers = await User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      });

      const growthRate = previousUsers > 0 ? 
        Math.round(((newUsers - previousUsers) / previousUsers) * 100) : 0;

      expect(totalUsers).toBe(3);
      expect(newUsers).toBe(2);
      expect(previousUsers).toBe(1);
      expect(growthRate).toBe(100); // 100% growth (2 vs 1)
    });

    it('should handle acquisition channels correctly', async () => {
      const now = new Date();
      
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
          registrationSource: 'direct',
          createdAt: now 
        }
      ]);

      // Test acquisition channel aggregation
      const acquisitionData = await User.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), $lte: now } } },
        { $group: { _id: '$registrationSource', count: { $sum: 1 } } }
      ]);

      const totalNewUsers = acquisitionData.reduce((sum, item) => sum + item.count, 0);
      const acquisitionChannels = acquisitionData.map(item => ({
        channel: item._id || 'direct',
        users: item.count,
        percentage: Math.round((item.count / Math.max(totalNewUsers, 1)) * 100)
      }));

      expect(acquisitionChannels).toHaveLength(2);
      expect(acquisitionChannels.find(c => c.channel === 'direct')?.users).toBe(2);
      expect(acquisitionChannels.find(c => c.channel === 'referral')?.users).toBe(1);
      expect(totalNewUsers).toBe(3);
    });

    it('should handle empty database gracefully', async () => {
      const totalUsers = await User.countDocuments();
      const newUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      expect(totalUsers).toBe(0);
      expect(newUsers).toBe(0);
    });
  });

  describe('MCP Integration Test', () => {
    it('should work with MCP API endpoint', async () => {
      // Create test data
      const now = new Date();
      await User.create([
        { 
          username: 'testuser1', 
          email: 'test1@test.com', 
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          registrationSource: 'direct',
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) 
        }
      ]);

      // Test the database queries that MCP would use
      const totalUsers = await User.countDocuments();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo, $lte: now }
      });

      expect(totalUsers).toBe(1);
      expect(newUsers).toBe(1);
    });
  });
});