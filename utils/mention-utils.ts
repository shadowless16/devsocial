import User from "@/models/User"
import UserMention from "@/models/UserMention"
import Notification from "@/models/Notification"
import connectDB from "@/lib/db"

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
  if (usernames.length === 0) return

  for (const username of usernames) {
    try {
      const mentionedUser = await User.findOne({ username })
      if (!mentionedUser || mentionedUser._id.toString() === mentionerId) continue

      // Create mention record
      await UserMention.create({
        post: postId,
        comment: commentId,
        mentioner: mentionerId,
        mentioned: mentionedUser._id
      })

      // Create notification
      const mentioner = await User.findById(mentionerId)
      await Notification.create({
        recipient: mentionedUser._id,
        sender: mentionerId,
        type: "mention",
        title: "You were mentioned",
        message: `${mentioner?.displayName || mentioner?.username} mentioned you in a ${commentId ? 'comment' : 'post'}`,
        metadata: { postId, commentId }
      })
    } catch (error) {
      console.error(`Error processing mention for ${username}:`, error)
    }
  }
}