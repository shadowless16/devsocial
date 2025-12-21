import Notification from '@/models/Notification'
import { sendPushToUser } from './push-service'

interface CreateNotificationParams {
  recipient: string
  sender: string
  type: 'like' | 'comment' | 'follow' | 'project_like' | 'mention' | 'system' | 'xp_overtake' | 'xp_overtaken' | 'message'
  title: string
  message: string
  relatedPost?: string
  relatedProject?: string
  relatedComment?: string
  actionUrl?: string
}

export async function createNotificationWithPush(params: CreateNotificationParams) {
  console.log('[DEBUG-NOTIF] createNotificationWithPush called with:', params);
  try {
    const notification = await Notification.create(params)
    console.log('[DEBUG-NOTIF] DB Notification created:', notification._id);

    const pushPayload = {
      title: params.title,
      body: params.message,
      url: params.actionUrl || '/',
      icon: '/icon-192x192.png',
      tag: params.type
    }

    console.log('[DEBUG-NOTIF] Sending push to user:', params.recipient);
    const pushResult = await sendPushToUser(params.recipient, pushPayload).catch(err => {
      console.error('[DEBUG-NOTIF] Failed to send push notification (catch):', err)
      return { success: false, reason: err.message }
    })
    console.log('[DEBUG-NOTIF] Push result:', pushResult);

    return notification
  } catch (error) {
    console.error('[DEBUG-NOTIF] Failed to create notification:', error)
    throw error
  }
}

export async function notifyLike(recipientId: string, senderId: string, postId: string, senderUsername: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'like',
    title: '❤️ New Like',
    message: `${senderUsername} liked your post`,
    relatedPost: postId,
    actionUrl: `/posts/${postId}`
  })
}

export async function notifyComment(recipientId: string, senderId: string, postId: string, senderUsername: string, commentPreview: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'comment',
    title: '💬 New Comment',
    message: `${senderUsername}: ${commentPreview.substring(0, 50)}${commentPreview.length > 50 ? '...' : ''}`,
    relatedPost: postId,
    actionUrl: `/posts/${postId}`
  })
}

export async function notifyFollow(recipientId: string, senderId: string, senderUsername: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'follow',
    title: '👤 New Follower',
    message: `${senderUsername} started following you`,
    actionUrl: `/profile/${senderUsername}`
  })
}

export async function notifyMention(recipientId: string, senderId: string, postId: string, senderUsername: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'mention',
    title: '📢 You were mentioned',
    message: `${senderUsername} mentioned you in a post`,
    relatedPost: postId,
    actionUrl: `/posts/${postId}`
  })
}

export async function notifyXPOvertake(recipientId: string, senderId: string, senderUsername: string, xpDifference: number) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'xp_overtake',
    title: '🏆 You\'ve been overtaken!',
    message: `${senderUsername} just passed you by ${xpDifference} XP! Time to level up!`,
    actionUrl: '/leaderboard'
  })
}

export async function notifyXPOvertaken(recipientId: string, senderId: string, overtakenUsername: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'xp_overtaken',
    title: '🎉 You overtook someone!',
    message: `You just overtook ${overtakenUsername} on the leaderboard!`,
    actionUrl: '/leaderboard'
  })
}

export async function notifyMessage(recipientId: string, senderId: string, senderUsername: string, messagePreview: string) {
  return createNotificationWithPush({
    recipient: recipientId,
    sender: senderId,
    type: 'message',
    title: '💬 New Message',
    message: `${senderUsername}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    actionUrl: '/messages'
  })
}
