import User from "@/models/User"
import UserMention from "@/models/UserMention"
import connectDB from "@/lib/core/db"
import { notifyMention } from "@/lib/notifications/notification-helper"
import { sendPushToUser } from "@/lib/notifications/push-service"
import { notifyViaEmail } from "@/lib/notifications/email-helper"

export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const matches = content.match(mentionRegex) || []
  return matches.map(mention => mention.substring(1)) // Remove @ symbol
}

export async function processMentions(
  content: string,
  postId: string,
  mentionerId: string,
  commentId?: string
) {
  await connectDB()
  
  const usernames = extractMentions(content)
  if (usernames.length === 0) return { mentions: [], mentionIds: [] }

  const mentions: string[] = []
  const mentionIds: string[] = []

  for (const username of usernames) {
    try {
      const mentionedUser = await User.findOne({ username })
      if (!mentionedUser || mentionedUser._id.toString() === mentionerId) continue

      mentions.push(username)
      mentionIds.push(mentionedUser._id.toString())

      // Create mention record
      await UserMention.create({
        post: postId,
        comment: commentId,
        mentioner: mentionerId,
        mentioned: mentionedUser._id
      })

      // Create notification with push
      const mentioner = await User.findById(mentionerId)
      await notifyMention(
        mentionedUser._id.toString(),
        mentionerId,
        postId,
        mentioner?.displayName || mentioner?.username || 'Someone'
      )

      // Send Push Notification
      try {
        await sendPushToUser(mentionedUser._id.toString(), {
          title: 'You were mentioned',
          body: `${mentioner?.displayName || mentioner?.username || 'Someone'} mentioned you in a post`,
          url: `/post/${postId}`,
          tag: `mention-${postId}`
        })
      } catch (pushError) {
        console.error('[Mention] Failed to send push:', pushError)
      }

      // Send Email Notification
      notifyViaEmail(mentionedUser._id.toString(), 'mention', {
        senderName: mentioner?.displayName || mentioner?.username || 'Someone',
        actionUrl: `/post/${postId}`,
        preview: content.substring(0, 100)
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error(`Error processing mention for ${username}:`, errorMessage)
    }
  }

  return { mentions, mentionIds }
}