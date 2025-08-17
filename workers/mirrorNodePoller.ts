import connectDB from '@/lib/db'
import Post from '@/models/Post'

const MIRROR_NODE_BASE_URL = process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com'
const MAX_POLL_RETRIES = 10
const POLL_INTERVAL_MS = 5000
const BATCH_SIZE = 50

interface MirrorNodeTransaction {
  transaction_id: string
  consensus_timestamp: string
  result: string
}

// Step 8: Mirror node confirmation polling (robustness)
export async function pollMirrorNodeConfirmations(): Promise<void> {
  try {
    await connectDB()
    
    // Find posts with submitted status that need confirmation
    const submittedPosts = await Post.find({
      imprintStatus: 'submitted',
      'onChainProof.txId': { $exists: true }
    }).limit(BATCH_SIZE)
    
    if (submittedPosts.length === 0) {
      return
    }
    
    console.log(`Polling ${submittedPosts.length} transactions for confirmation`)
    
    for (const post of submittedPosts) {
      await pollTransactionConfirmation(post)
    }
    
  } catch (error) {
    console.error('Mirror node polling failed:', error)
  }
}

async function pollTransactionConfirmation(post: any): Promise<void> {
  const { _id: postId, onChainProof } = post
  
  if (!onChainProof?.txId) {
    console.warn(`Post ${postId} missing transaction ID`)
    return
  }
  
  try {
    const isConfirmed = await checkTransactionOnMirror(onChainProof.txId)
    
    if (isConfirmed) {
      // Update post as confirmed
      await Post.findByIdAndUpdate(postId, {
        imprintStatus: 'confirmed',
        'onChainProof.confirmedAt': new Date()
      })
      
      console.log(`Post ${postId} confirmed on mirror node`)
    } else {
      // Check if we should retry or mark as pending
      const hoursSinceSubmission = (Date.now() - onChainProof.submittedAt.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceSubmission > 1) { // After 1 hour, mark for manual retry
        await Post.findByIdAndUpdate(postId, {
          imprintStatus: 'pending', // Back to pending for manual retry queue
          'onChainProof.retryCount': (onChainProof.retryCount || 0) + 1
        })
        
        console.warn(`Post ${postId} not found after ${hoursSinceSubmission.toFixed(1)}h, marked for retry`)
      }
    }
    
  } catch (error) {
    console.error(`Failed to poll transaction ${onChainProof.txId} for post ${postId}:`, error)
  }
}

async function checkTransactionOnMirror(txId: string): Promise<boolean> {
  try {
    const response = await fetch(`${MIRROR_NODE_BASE_URL}/api/v1/transactions/${txId}`)
    
    if (response.status === 404) {
      return false // Transaction not found yet
    }
    
    if (!response.ok) {
      throw new Error(`Mirror node API error: ${response.status}`)
    }
    
    const data = await response.json()
    const transaction = data.transactions?.[0] as MirrorNodeTransaction
    
    return transaction?.result === 'SUCCESS'
    
  } catch (error) {
    console.error(`Mirror node query failed for ${txId}:`, error)
    return false
  }
}

// Scheduled poller function
export async function startMirrorNodePoller(): Promise<void> {
  console.log('Starting mirror node confirmation poller')
  
  const poll = async () => {
    try {
      await pollMirrorNodeConfirmations()
    } catch (error) {
      console.error('Polling cycle failed:', error)
    }
    
    // Schedule next poll
    setTimeout(poll, POLL_INTERVAL_MS)
  }
  
  // Start first poll
  poll()
}