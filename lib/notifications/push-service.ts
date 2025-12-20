import webpush from 'web-push'
import User from '@/models/User'
import { connectWithRetry } from '@/lib/core/connect-with-retry'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@devsocial.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  image?: string
  tag?: string
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    await connectWithRetry()
    const user = await User.findById(userId).select('pushSubscription')
    
    if (!user?.pushSubscription) {
      return { success: false, reason: 'No subscription' }
    }

    const subscription = user.pushSubscription as any
    
    // Check if it's a mock subscription (localhost fallback)
    if (subscription.endpoint?.includes('mock-push') || subscription.keys?.p256dh === 'mock-key') {
      console.log('Mock subscription detected - skipping actual push (localhost mode)')
      return { success: true, mock: true, message: 'Mock notification (localhost mode)' }
    }

    const result = await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify(payload)
    )

    return { success: true, result }
  } catch (error: unknown) {
    console.error('Push notification error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } })
      return { success: false, expired: true }
    }
    
    return { success: false, error }
  }
}

export async function sendPushToMultipleUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushToUser(userId, payload))
  )
  
  return {
    total: userIds.length,
    successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
    failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length
  }
}
