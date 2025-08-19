import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import User from '../../models/User';
import { POST as signupRoute } from '../../app/api/auth/signup/route';
import { PUT as onboardingRoute } from '../../app/api/users/onboarding/route';
import { POST as saveAvatarRoute } from '../../app/api/save-avatar/route';

// Mock dependencies
jest.mock('../../utils/awardXP', () => ({
  awardXP: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../utils/referral-system-fixed', () => ({
  ReferralSystemFixed: {
    processReferralFromSignup: jest.fn().mockResolvedValue(true)
  }
}));

jest.mock('../../models/Follow', () => ({
  create: jest.fn().mockResolvedValue({})
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

import { getServerSession } from 'next-auth';
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

let testUserId: string;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  const testDbUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI + '_test';
  
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await User.deleteMany({ email: { $regex: /@avatartest\.com$/ } });
  
  // Reset mocks
  mockedGetServerSession.mockReset();
});

describe('Avatar Creation During Signup Flow', () => {
  describe('Initial Avatar Generation', () => {
    it('should create user with initial avatar during signup', async () => {
      const signupData = {
        username: 'avataruser',
        email: 'avataruser@avatartest.com',
        password: 'Password123!',
        firstName: 'Avatar',
        lastName: 'User',
        birthMonth: 5,
        birthDay: 15,
        affiliation: 'Test University'
      };

      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });

      const response = await signupRoute(request);
      const responseData = await response.json();
      
      // Handle the mock response structure
      const data = responseData._data || responseData;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.avatar).toBeDefined();
      expect(data.data.user.avatar).toContain('avataruser'); // Should contain username

      // Verify user was created in database with avatar
      const user = await User.findOne({ email: signupData.email });
      expect(user).toBeTruthy();
      expect(user?.avatar).toBeDefined();
      expect(user?.avatar).toBe(data.data.user.avatar);

      testUserId = user!._id.toString();
    });

    it('should generate different avatars for different usernames', async () => {
      const users = [
        { username: 'user1', email: 'user1@avatartest.com' },
        { username: 'user2', email: 'user2@avatartest.com' }
      ];

      const avatars: string[] = [];

      for (const userData of users) {
        const signupData = {
          ...userData,
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          birthMonth: 5,
          birthDay: 15,
          affiliation: 'Test University'
        };

        const request = new NextRequest('http://localhost/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify(signupData),
        });

        const response = await signupRoute(request);
        const responseData = await response.json();
        
        // Handle the mock response structure
        const data = responseData._data || responseData;

        expect(response.status).toBe(201);
        avatars.push(data.data.user.avatar);
      }

      // Avatars should be different
      expect(avatars[0]).not.toBe(avatars[1]);
    });
  });

  describe('Avatar Update During Onboarding', () => {
    beforeEach(async () => {
      // Create a test user first
      const user = await User.create({
        username: 'onboardinguser',
        email: 'onboarding@avatartest.com',
        password: 'hashedpassword',
        firstName: 'Onboarding',
        lastName: 'User',
        birthMonth: 5,
        birthDay: 15,
        affiliation: 'Test University',
        avatar: 'initial-avatar-url'
      });
      testUserId = user._id.toString();

      // Mock session
      mockedGetServerSession.mockResolvedValue({
        user: { id: testUserId, email: 'onboarding@avatartest.com' }
      } as any);
    });

    it('should update avatar with Ready Player Me URL during onboarding', async () => {
      const onboardingData = {
        gender: 'male',
        userType: 'developer',
        bio: 'Test bio',
        avatar: 'https://models.readyplayer.me/64f123abc456def789.glb'
      };

      const request = new NextRequest('http://localhost/api/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify(onboardingData),
      });

      const response = await onboardingRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify avatar was updated in database
      const user = await User.findById(testUserId);
      expect(user?.avatar).toBe(onboardingData.avatar);
      expect(user?.onboardingCompleted).toBe(true);
    });

    it('should generate gender-specific avatar if no RPM avatar provided', async () => {
      const onboardingData = {
        gender: 'female',
        userType: 'designer',
        bio: 'Test bio'
        // No avatar provided
      };

      const request = new NextRequest('http://localhost/api/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify(onboardingData),
      });

      const response = await onboardingRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify gender-specific avatar was generated
      const user = await User.findById(testUserId);
      expect(user?.avatar).toBeDefined();
      expect(user?.avatar).not.toBe('initial-avatar-url'); // Should be updated
      expect(user?.gender).toBe('female');
    });

    it('should preserve RPM avatar over gender generation', async () => {
      const rpmAvatar = 'https://models.readyplayer.me/64f123abc456def789.glb';
      const onboardingData = {
        gender: 'male',
        userType: 'developer',
        bio: 'Test bio',
        avatar: rpmAvatar
      };

      const request = new NextRequest('http://localhost/api/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify(onboardingData),
      });

      const response = await onboardingRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify RPM avatar was preserved
      const user = await User.findById(testUserId);
      expect(user?.avatar).toBe(rpmAvatar);
    });
  });

  describe('Save Avatar API', () => {
    beforeEach(() => {
      mockedGetServerSession.mockResolvedValue({
        user: { email: 'savetest@avatartest.com' }
      } as any);
    });

    it('should save valid Ready Player Me avatar URL', async () => {
      // Create user first
      await User.create({
        username: 'saveuser',
        email: 'savetest@avatartest.com',
        password: 'hashedpassword',
        firstName: 'Save',
        lastName: 'User',
        avatar: 'old-avatar'
      });

      const avatarUrl = 'https://models.readyplayer.me/64f123abc456def789.glb';
      const request = new NextRequest('http://localhost/api/save-avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl }),
      });

      const response = await saveAvatarRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.avatarUrl).toBe(avatarUrl);

      // Verify avatar was saved in database
      const user = await User.findOne({ email: 'savetest@avatartest.com' });
      expect(user?.avatar).toBe(avatarUrl);
    });

    it('should reject invalid avatar URLs', async () => {
      const invalidUrls = [
        'https://example.com/avatar.png',
        'https://models.readyplayer.me/invalid',
        'not-a-url',
        ''
      ];

      for (const avatarUrl of invalidUrls) {
        const request = new NextRequest('http://localhost/api/save-avatar', {
          method: 'POST',
          body: JSON.stringify({ avatarUrl }),
        });

        const response = await saveAvatarRoute(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBeFalsy();
      }
    });

    it('should require authentication', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/save-avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl: 'https://models.readyplayer.me/test.glb' }),
      });

      const response = await saveAvatarRoute(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Avatar Display Integration', () => {
    it('should handle both 3D (.glb) and 2D (.png) avatar formats', async () => {
      const user = await User.create({
        username: 'displayuser',
        email: 'display@avatartest.com',
        password: 'hashedpassword',
        firstName: 'Display',
        lastName: 'User',
        avatar: 'https://models.readyplayer.me/64f123abc456def789.glb'
      });

      // Test that we can derive both formats
      const glbUrl = user.avatar;
      const pngUrl = glbUrl.replace('.glb', '.png');

      expect(glbUrl).toContain('.glb');
      expect(pngUrl).toContain('.png');
      expect(pngUrl).toContain('models.readyplayer.me');
    });

    it('should maintain avatar consistency across user updates', async () => {
      const initialAvatar = 'https://models.readyplayer.me/initial.glb';
      
      const user = await User.create({
        username: 'consistentuser',
        email: 'consistent@avatartest.com',
        password: 'hashedpassword',
        firstName: 'Consistent',
        lastName: 'User',
        avatar: initialAvatar
      });

      // Update user without changing avatar
      user.bio = 'Updated bio';
      await user.save();

      // Avatar should remain unchanged
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.avatar).toBe(initialAvatar);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing avatar gracefully during onboarding', async () => {
      const user = await User.create({
        username: 'erroruser',
        email: 'error@avatartest.com',
        password: 'hashedpassword',
        firstName: 'Error',
        lastName: 'User'
        // No avatar field
      });

      mockedGetServerSession.mockResolvedValue({
        user: { id: user._id.toString(), email: 'error@avatartest.com' }
      } as any);

      const onboardingData = {
        gender: 'male',
        userType: 'developer',
        bio: 'Test bio'
      };

      const request = new NextRequest('http://localhost/api/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify(onboardingData),
      });

      const response = await onboardingRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Should have generated an avatar
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.avatar).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      mockedGetServerSession.mockResolvedValue({
        user: { id: 'invalid-id', email: 'test@avatartest.com' }
      } as any);

      const request = new NextRequest('http://localhost/api/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify({ gender: 'male' }),
      });

      const response = await onboardingRoute(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);

      // Restore original method
      User.findById = originalFindById;
    });
  });
});