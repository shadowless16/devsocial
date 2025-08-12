import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/db');
vi.mock('@/models/User');
vi.mock('@/models/Follow');
vi.mock('bcryptjs');
vi.mock('@/utils/awardXP');
vi.mock('@/utils/referral-system');
vi.mock('@/utils/avatar-generator');

const mockConnectDB = connectDB as Mock;
const mockUser = User as any;
const mockBcrypt = bcrypt as any;

describe('Signup API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
    mockBcrypt.hash.mockResolvedValue('hashedPassword123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validSignupData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    birthMonth: 5,
    birthDay: 15,
    affiliation: 'Test University'
  };

  it('should successfully create a new user', async () => {
    // Mock User.findOne to return null (no existing user)
    mockUser.findOne.mockResolvedValue(null);
    
    // Mock User.create to return a new user
    const mockCreatedUser = {
      _id: 'user123',
      ...validSignupData,
      password: 'hashedPassword123',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testuser',
      points: 10,
      badges: ['newcomer'],
      level: 1,
      createdAt: new Date()
    };
    mockUser.create.mockResolvedValue(mockCreatedUser);

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe('testuser');
    expect(data.data.user.email).toBe('test@example.com');
    expect(data.data.token).toBeDefined();
    expect(data.data.user.password).toBeUndefined(); // Password should not be returned
  });

  it('should return error if email already exists', async () => {
    mockUser.findOne.mockResolvedValue({ email: 'test@example.com' });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Email already exists');
  });

  it('should return error if username already exists', async () => {
    mockUser.findOne.mockResolvedValue({ username: 'testuser' });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Username already exists');
  });

  it('should validate required fields', async () => {
    const invalidData = {
      username: 'te', // Too short
      email: 'invalid-email',
      password: '123', // Too weak
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.details).toBeDefined();
  });

  it('should generate avatar for new user', async () => {
    mockUser.findOne.mockResolvedValue(null);
    
    const mockCreatedUser = {
      _id: 'user123',
      ...validSignupData,
      password: 'hashedPassword123',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testuser',
      points: 10,
      badges: ['newcomer']
    };
    mockUser.create.mockResolvedValue(mockCreatedUser);

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.user.avatar).toContain('readyplayer.me');
    expect(mockUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: expect.stringContaining('readyplayer.me')
      })
    );
  });

  it('should handle database connection errors', async () => {
    mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Internal server error');
  });

  it('should handle referral code if provided', async () => {
    mockUser.findOne.mockResolvedValueOnce(null); // No existing user
    mockUser.findOne.mockResolvedValueOnce({ _id: 'referrer123', referralCode: 'REF123' }); // Referrer exists
    
    const mockCreatedUser = {
      _id: 'user123',
      ...validSignupData,
      password: 'hashedPassword123',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testuser',
      points: 10,
      badges: ['newcomer']
    };
    mockUser.create.mockResolvedValue(mockCreatedUser);

    const signupDataWithReferral = {
      ...validSignupData,
      referralCode: 'REF123'
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupDataWithReferral)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});