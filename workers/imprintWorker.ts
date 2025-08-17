import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { submitConsensusMessage, createConsensusMessage } from '@/lib/hedera-adapter'
import { ImprintJob } from '@/services/imprintQueue'
import logger from '@/lib/logger'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const HEDERA_TOPIC_ID = process.env.HEDERA_TOPIC_ID || '0.0.123456'

// Metrics counters
let imprintJobsProcessed = 0
let imprintFailures = 0
let imprintConfirmedCount = 0
let pendingImprintsCount = 0

// Export metrics for monitoring
export const getImprintMetrics = () => ({
  imprintJobsProcessed,
  imprintFailures,
  imprintConfirmedCount,
  pendingImprintsCount
})

// Step 7: Worker action - submit message & store proof (atomic)
// Step 9: Idempotency & duplicate protection
export async function processImprintJob(job: ImprintJob): Promise<void> {
  const { postId, contentHash } = job
  
  logger.info('Processing imprint job', { postId, contentHash })
  imprintJobsProcessed++
  
  try {
    await connectDB()
    
    // Step 9: Check for duplicate contentHash before processing
    const existingPost = await Post.findOne({
      contentHash,
      onChainProof: { $exists: true, $ne: null }
    })
    
    if (existingPost) {
      logger.info('Duplicate content detected', { 
        postId, 
        contentHash, 
        existingPostId: existingPost._id 
      })
      
      // Mark current job as completed since content already exists on-chain
      await Post.findByIdAndUpdate(postId, {
        imprintStatus: 'duplicate',
        duplicateOf: existingPost._id
      })
      return
    }
    
    // Verify post exists and is in pending state
    const post = await Post.findById(postId).populate('author', '_id')
    if (!post) {
      throw new Error(`Post not found: ${postId}`)
    }
    
    if (post.imprintStatus !== 'pending') {
      logger.info('Post already processed', { postId, status: post.imprintStatus })
      return
    }
    
    pendingImprintsCount++
    
    // Compose compact message per consensus design
    const messageString = createConsensusMessage(
      postId,
      post.author._id.toString(),
      contentHash
    )
    
    // Submit to Hedera with retry logic
    const result = await submitWithRetry(HEDERA_TOPIC_ID, messageString)
    
    // Atomic update: onChainProof and imprintStatus
    const updateData: any = {
      onChainProof: {
        topicId: result.topicId,
        seq: result.seq,
        txId: result.txId,
        submittedAt: result.submittedAt
      },
      imprintStatus: 'submitted'
    }
    
    // If adapter returns immediate confirmation, set as confirmed
    if (result.confirmedAt) {
      updateData.imprintStatus = 'confirmed'
      updateData.onChainProof.confirmedAt = result.confirmedAt
      imprintConfirmedCount++
    }
    
    await Post.findByIdAndUpdate(postId, updateData)
    pendingImprintsCount--
    
    logger.info('Imprint job completed', { 
      postId, 
      txId: result.txId, 
      status: updateData.imprintStatus 
    })
    
  } catch (error) {
    imprintFailures++
    pendingImprintsCount--
    
    logger.error('Imprint job failed', { 
      postId, 
      error: error instanceof Error ? error.message : String(error) 
    })
    
    // Mark as failed
    await Post.findByIdAndUpdate(postId, {
      imprintStatus: 'failed'
    }).catch(updateError => {
      logger.error('Failed to update post status to failed', { 
        postId, 
        updateError: updateError instanceof Error ? updateError.message : String(updateError) 
      })
    })
    
    // Alert if failure rate is high
    if (imprintFailures > 0 && imprintJobsProcessed > 0) {
      const failureRate = imprintFailures / imprintJobsProcessed
      if (failureRate > 0.1) { // Alert if >10% failure rate
        logger.error('High imprint failure rate detected', {
          failureRate: Math.round(failureRate * 100),
          totalJobs: imprintJobsProcessed,
          failures: imprintFailures
        })
      }
    }
  }
}

async function submitWithRetry(topicId: string, messageString: string, attempt = 1): Promise<any> {
  try {
    return await submitConsensusMessage(topicId, messageString)
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error
    }
    
    const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
    logger.warn('Retrying Hedera submission', { 
      attempt, 
      delay, 
      topicId, 
      error: error instanceof Error ? error.message : String(error) 
    })
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return submitWithRetry(topicId, messageString, attempt + 1)
  }
}