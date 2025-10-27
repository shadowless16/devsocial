import webpush from 'web-push'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@devsocial.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export async function sendPushNotification(
  subscription: any,
  payload: {
    title: string
    body: string
    url?: string
    icon?: string
    image?: string
  }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error: any) {
    console.error('Push notification error:', error)
    if (error.statusCode === 410) {
      return { success: false, expired: true }
    }
    return { success: false }
  }
}
