import { processImprintJob } from '@/workers/imprintWorker'
import { hashPost } from '@/lib/canonicalizer'
import Post from '@/models/Post'
import mongoose from 'mongoose'

// Mock Hedera adapter
jest.mock('@/lib/hedera-adapter', () => ({
  submitToHedera: jest.fn(),
  checkTransactionStatus: jest.fn()
}))

// Mock Post model
jest.mock('@/models/Post')

// Mock canonicalizer
jest.mock('@/lib/canonicalizer')

const mockHederaAdapter = require('@/lib/hedera-adapter')
const mockPost = Post as jest.Mocked<typeof Post>
const mockHashPost = hashPost as jest.MockedFunction<typeof hashPost>

describe('Imprint Worker', () => {
  const mockPostData = {
    _id: new mongoose.Types.ObjectId(),
    author: new mongoose.Types.ObjectId(),
    content: 'Test post content',
    tags: ['test'],
    createdAt: new Date(),
    imprintStatus: 'pending',
    onChainProof: null,
    save: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockHashPost.mockReturnValue('test-hash-123')
  })

  it('should process imprint job successfully', async () => {
    mockPost.findById.mockResolvedValue(mockPostData)
    mockHederaAdapter.submitToHedera.mockResolvedValue({
      success: true,
      txId: 'test-tx-id',
      topicId: 'test-topic-id',
      seq: 1
    })

    await processImprintJob({ postId: 'test-post-id', contentHash: 'test-hash-123' })

    expect(mockPost.findById).toHaveBeenCalledWith('test-post-id')
    expect(mockHashPost).toHaveBeenCalledWith(mockPostData)
    expect(mockHederaAdapter.submitToHedera).toHaveBeenCalledWith('test-hash-123')
    expect(mockPostData.save).toHaveBeenCalled()
  })

  it('should handle submission failure', async () => {
    mockPost.findById.mockResolvedValue(mockPostData)
    mockHederaAdapter.submitToHedera.mockResolvedValue({
      success: false,
      error: 'Network error'
    })

    await processImprintJob({ postId: 'test-post-id', contentHash: 'test-hash-123' })

    expect(mockPostData.imprintStatus).toBe('failed')
    expect(mockPostData.save).toHaveBeenCalled()
  })

  it('should handle post not found', async () => {
    mockPost.findById.mockResolvedValue(null)

    await expect(processImprintJob({ postId: 'invalid-id', contentHash: 'test-hash-123' })).rejects.toThrow('Post not found')
  })

  it('should write onChainProof on successful submission', async () => {
    const mockResult = {
      success: true,
      txId: 'test-tx-123',
      topicId: 'topic-456',
      seq: 42
    }

    mockPost.findById.mockResolvedValue(mockPostData)
    mockHederaAdapter.submitToHedera.mockResolvedValue(mockResult)

    await processImprintJob({ postId: 'test-post-id', contentHash: 'test-hash-123' })

    expect(mockPostData.imprintStatus).toBe('submitted')
    expect(mockPostData.onChainProof).toEqual({
      txId: 'test-tx-123',
      topicId: 'topic-456',
      seq: 42,
      submittedAt: expect.any(Date)
    })
  })

  it('should increment retry count on failure', async () => {
    const postWithRetries = {
      ...mockPostData,
      onChainProof: { retryCount: 2 }
    }

    mockPost.findById.mockResolvedValue(postWithRetries)
    mockHederaAdapter.submitToHedera.mockResolvedValue({
      success: false,
      error: 'Timeout'
    })

    await processImprintJob({ postId: 'test-post-id', contentHash: 'test-hash-123' })

    expect(postWithRetries.onChainProof.retryCount).toBe(3)
  })
})