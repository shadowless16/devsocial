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
    
    console.log('[PushService] Sending to user:', userId)
    console.log('[PushService] Has subscription:', !!user?.pushSubscription)
    
    if (!user?.pushSubscription) {
      return { success: false, reason: 'No push subscription found. Please subscribe first on the test page.' }
    }

    const subscription = user.pushSubscription as Record<string, unknown>
    
    console.log('[PushService] Subscription endpoint:', subscription.endpoint)
    
    // Check if it's a mock subscription (localhost fallback)
    const endpoint = subscription.endpoint as string | undefined
    const keys = subscription.keys as Record<string, string> | undefined
    const isMock = endpoint?.includes('mock-push') || 
                   endpoint?.includes('localhost') ||
                   keys?.p256dh === 'mock-key'
    
    if (isMock) {
      console.log('[PushService] Mock subscription detected - returning success for localhost mode')
      return { 
        success: true, 
        mock: true, 
        message: 'Localhost mode: Use browser notification test. Real push requires HTTPS.',
        payload // Return the payload so frontend can show browser notification
      }
    }

    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[PushService] VAPID keys not configured!')
      return { success: false, reason: 'VAPID keys not configured on server' }
    }

    const result = await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify(payload)
    )

    console.log('[PushService] Push sent successfully')
    return { success: true, result }
  } catch (error: unknown) {
    console.error('[PushService] Push notification error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } })
      return { success: false, expired: true, reason: 'Subscription expired. Please re-subscribe.' }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown push error'
    return { success: false, error, reason: errorMessage }
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
