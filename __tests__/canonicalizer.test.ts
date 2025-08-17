import { canonicalizePost, hashPost } from '@/lib/canonicalizer'
import { IPost } from '@/models/Post'
import mongoose from 'mongoose'

describe('Canonicalizer', () => {
  const samplePost = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    author: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    content: '  Hello world!  ',
    tags: ['tech', 'blockchain', 'ai'],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    imageUrls: ['https://example.com/image1.jpg'],
    videoUrls: [],
    isAnonymous: false,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    xpAwarded: 20,
    contentHash: null,
    imprintStatus: 'none' as const,
    onChainProof: null,
    updatedAt: new Date(),
  }

  it('should canonicalize post correctly', () => {
    const canonical = canonicalizePost(samplePost as unknown as IPost)
    const parsed = JSON.parse(canonical)
    
    expect(parsed.authorId).toBe('507f1f77bcf86cd799439012')
    expect(parsed.content).toBe('Hello world!')
    expect(parsed.contentType).toBe('image')
    expect(parsed.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(parsed.postId).toBe('507f1f77bcf86cd799439011')
    expect(parsed.metadata.hasMedia).toBe(true)
    expect(parsed.metadata.mediaCount).toBe(1)
    expect(parsed.metadata.tags).toEqual(['ai', 'blockchain', 'tech'])
  })

  it('should produce consistent hash for same content', () => {
    const hash1 = hashPost(samplePost as unknown as IPost)
    const hash2 = hashPost(samplePost as unknown as IPost)
    
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should produce different hash for different content', () => {
    const modifiedPost = { ...samplePost, content: 'Different content' }
    
    const hash1 = hashPost(samplePost as unknown as IPost)
    const hash2 = hashPost(modifiedPost as unknown as IPost)
    
    expect(hash1).not.toBe(hash2)
  })

  it('should handle text-only posts', () => {
    const textPost = {
      ...samplePost,
      imageUrls: [],
      videoUrls: [],
      imageUrl: undefined
    }
    
    const canonical = canonicalizePost(textPost as unknown as IPost)
    const parsed = JSON.parse(canonical)
    
    expect(parsed.contentType).toBe('text')
    expect(parsed.metadata.hasMedia).toBe(false)
    expect(parsed.metadata.mediaCount).toBe(0)
  })

  it('should sort tags consistently', () => {
    const post1 = { ...samplePost, tags: ['z', 'a', 'm'] }
    const post2 = { ...samplePost, tags: ['a', 'm', 'z'] }
    
    const canonical1 = canonicalizePost(post1 as unknown as IPost)
    const canonical2 = canonicalizePost(post2 as unknown as IPost)
    
    expect(canonical1).toBe(canonical2)
  })
})