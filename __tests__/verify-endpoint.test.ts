import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { POST } from '@/app/api/posts/verify/route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { computeContentHash } from '@/lib/contentHash';

// Mock dependencies
vi.mock('@/lib/db');
vi.mock('@/models/Post');
vi.mock('@/lib/contentHash');

const mockConnectDB = connectDB as Mock;
const mockPost = Post as any;
const mockComputeContentHash = computeContentHash as Mock;

describe('Verify Endpoint API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockPostData = {
    _id: 'post123',
    content: 'Test post content',
    imageUrls: ['https://example.com/image1.jpg'],
    videoUrls: [],
    tags: ['test', 'content'],
    contentHash: 'abc123hash',
    imprintStatus: 'confirmed',
    onChainProof: {
      topicId: 'topic123',
      seq: 1,
      txId: 'tx123',
      submittedAt: new Date(),
      confirmedAt: new Date()
    }
  };

  describe('Verification by postId', () => {
    it('should verify post by postId with matching hash', async () => {
      const computedHash = 'abc123hash';
      mockPost.findById.mockResolvedValue(mockPostData);
      mockComputeContentHash.mockReturnValue(computedHash);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(true);
      expect(data.proof).toEqual(mockPostData.onChainProof);
      expect(data.computedHash).toBe(computedHash);
      expect(data.storedHash).toBe(mockPostData.contentHash);
      expect(data.imprintStatus).toBe('confirmed');
    });

    it('should detect hash mismatch for post by postId', async () => {
      const computedHash = 'differenthash';
      mockPost.findById.mockResolvedValue(mockPostData);
      mockComputeContentHash.mockReturnValue(computedHash);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(false);
      expect(data.computedHash).toBe(computedHash);
      expect(data.storedHash).toBe(mockPostData.contentHash);
    });

    it('should return 404 when post not found by postId', async () => {
      mockPost.findById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'nonexistent' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Post not found');
    });
  });

  describe('Verification by content', () => {
    it('should verify post by content with matching hash', async () => {
      const contentData = {
        content: 'Test content',
        imageUrls: ['image1.jpg'],
        tags: ['test']
      };
      const computedHash = 'content123hash';
      
      mockComputeContentHash.mockReturnValue(computedHash);
      mockPost.findOne.mockResolvedValue({
        ...mockPostData,
        contentHash: computedHash
      });

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ content: contentData })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(true);
      expect(data.computedHash).toBe(computedHash);
      expect(mockComputeContentHash).toHaveBeenCalledWith(contentData);
      expect(mockPost.findOne).toHaveBeenCalledWith({ contentHash: computedHash });
    });

    it('should return no match when content not found', async () => {
      const contentData = { content: 'Unknown content' };
      const computedHash = 'unknown123hash';
      
      mockComputeContentHash.mockReturnValue(computedHash);
      mockPost.findOne.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ content: contentData })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(false);
      expect(data.proof).toBe(null);
      expect(data.computedHash).toBe(computedHash);
      expect(data.storedHash).toBe(null);
    });
  });

  describe('Error handling', () => {
    it('should return 400 when neither postId nor content provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Either postId or content is required');
    });

    it('should handle database connection errors', async () => {
      mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle Post.findById errors', async () => {
      mockPost.findById.mockRejectedValue(new Error('Database query failed'));

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle computeContentHash errors', async () => {
      mockPost.findById.mockResolvedValue(mockPostData);
      mockComputeContentHash.mockImplementation(() => {
        throw new Error('Hash computation failed');
      });

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Edge cases', () => {
    it('should handle post with null contentHash', async () => {
      const postWithNullHash = { ...mockPostData, contentHash: null };
      mockPost.findById.mockResolvedValue(postWithNullHash);
      mockComputeContentHash.mockReturnValue('computed123');

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(false);
      expect(data.storedHash).toBe(null);
    });

    it('should handle post with no onChainProof', async () => {
      const postWithoutProof = { ...mockPostData, onChainProof: null };
      mockPost.findById.mockResolvedValue(postWithoutProof);
      mockComputeContentHash.mockReturnValue(mockPostData.contentHash);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.match).toBe(true);
      expect(data.proof).toBe(null);
    });

    it('should handle empty arrays in post data', async () => {
      const postWithEmptyArrays = {
        ...mockPostData,
        imageUrls: [],
        videoUrls: [],
        tags: []
      };
      mockPost.findById.mockResolvedValue(postWithEmptyArrays);
      mockComputeContentHash.mockReturnValue(mockPostData.contentHash);

      const request = new NextRequest('http://localhost:3000/api/posts/verify', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123' })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockComputeContentHash).toHaveBeenCalledWith({
        content: postWithEmptyArrays.content,
        imageUrls: [],
        videoUrls: [],
        tags: []
      });
    });
  });
});