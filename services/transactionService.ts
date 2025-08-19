import Transaction from '@/models/Transaction'
import User from '@/models/User'
import Notification from '@/models/Notification'
import connectDB from '@/lib/db'

export interface TransferRequest {
  fromUserId?: string
  toUserId?: string
  fromUsername?: string
  toUsername?: string
  amount: number
  description?: string
  type?: 'transfer' | 'reward' | 'system'
}

export interface UsernameTransferRequest {
  fromUsername: string
  toUsername: string
  amount: number
  description?: string
  type?: 'transfer' | 'reward' | 'system'
}

export interface TransactionResult {
  success: boolean
  transaction?: any
  message: string
  balance?: number
}

export class TransactionService {
  static async transfer(request: TransferRequest): Promise<TransactionResult> {
    await connectDB()
    
    const { fromUserId, toUserId, fromUsername, toUsername, amount, description, type = 'transfer' } = request
    
    // Validate amount
    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' }
    }
    
    // Get users - support both ID and username lookup
    let fromUser, toUser
    
    if (fromUsername && toUsername) {
      // Try to find by username first, then by ObjectId if it looks like one
      const isToUserObjectId = /^[0-9a-fA-F]{24}$/.test(toUsername)
      const isFromUserObjectId = /^[0-9a-fA-F]{24}$/.test(fromUsername)
      
      // Execute queries sequentially to avoid Promise.all issues
      fromUser = isFromUserObjectId ? await User.findById(fromUsername) : await User.findOne({ username: fromUsername })
      toUser = isToUserObjectId ? await User.findById(toUsername) : await User.findOne({ username: toUsername })
    } else if (fromUserId && toUserId) {
      [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId),
        User.findById(toUserId)
      ])
    } else {
      return { success: false, message: 'Must provide either usernames or user IDs' }
    }
    
    if (!fromUser) {
      return { success: false, message: 'Sender not found' }
    }
    
    if (!toUser) {
      return { success: false, message: 'Recipient not found' }
    }
    
    // Check balance for non-system transactions
    if (type !== 'system' && fromUser.demoWalletBalance < amount) {
      return { 
        success: false, 
        message: 'Insufficient balance',
        balance: fromUser.demoWalletBalance 
      }
    }
    
    // Create transaction
    const transaction = new Transaction({
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      amount,
      type,
      status: 'completed',
      description: description || `${type} transaction`
    })
    
    // Update balances
    if (type !== 'system') {
      fromUser.demoWalletBalance -= amount
    }
    toUser.demoWalletBalance += amount
    
    // Save everything
    await Promise.all([
      transaction.save(),
      fromUser.save(),
      toUser.save()
    ])
    
    // Send notification to recipient
    await this.sendTransferNotification(fromUser, toUser, amount, type, description)
    
    return {
      success: true,
      transaction: transaction.toObject(),
      message: 'Transfer completed successfully',
      balance: fromUser.demoWalletBalance
    }
  }
  
  static async getBalance(userId: string): Promise<number> {
    await connectDB()
    const user = await User.findById(userId)
    return user?.demoWalletBalance || 0
  }
  
  static async getTransactionHistory(userId: string, page = 1, limit = 10) {
    await connectDB()
    
    const skip = (page - 1) * limit
    
    const transactions = await Transaction.find({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    
    const total = await Transaction.countDocuments({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    })
    
    return {
      transactions,
      page,
      limit,
      total,
      hasMore: skip + transactions.length < total
    }
  }
  
  static async transferByUsername(request: UsernameTransferRequest): Promise<TransactionResult> {
    return this.transfer({
      fromUsername: request.fromUsername,
      toUsername: request.toUsername,
      amount: request.amount,
      description: request.description,
      type: request.type
    })
  }
  
  static async rewardUser(userId: string, amount: number, description: string): Promise<TransactionResult> {
    return this.transfer({
      fromUserId: 'system',
      toUserId: userId,
      amount,
      description,
      type: 'reward'
    })
  }
  
  static async rewardUserByUsername(username: string, amount: number, description: string): Promise<TransactionResult> {
    return this.transfer({
      fromUsername: 'system',
      toUsername: username,
      amount,
      description,
      type: 'reward'
    })
  }
  
  private static async sendTransferNotification(
    fromUser: any, 
    toUser: any, 
    amount: number, 
    type: string, 
    description?: string
  ): Promise<void> {
    try {
      // Don't send notification for system transactions
      if (type === 'system' || fromUser.username === 'system') {
        return
      }
      
      const notificationTitle = type === 'reward' 
        ? `You received a reward!` 
        : `You received ${amount} HBAR`
        
      const notificationMessage = type === 'reward'
        ? `${fromUser.username} sent you ${amount} HBAR as a reward${description ? `: ${description}` : ''}`
        : `${fromUser.username} sent you ${amount} HBAR${description ? `: ${description}` : ''}`
      
      await new Notification({
        recipient: toUser._id,
        sender: fromUser._id,
        type: 'system',
        title: notificationTitle,
        message: notificationMessage,
        actionUrl: '/dashboard'
      }).save()
    } catch (error) {
      console.error('Failed to send transfer notification:', error)
      // Don't fail the transaction if notification fails
    }
  }
}