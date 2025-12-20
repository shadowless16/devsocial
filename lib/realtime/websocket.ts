import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import User from "@/models/User"
import Message from "@/models/Message"
import Conversation from "@/models/Conversation"
import Notification from "@/models/Notification"

export class WebSocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map() // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const userId = socket.handshake.auth.userId
        if (!userId) {
          return next(new Error("Authentication error"))
        }

        const user = await User.findById(userId).select("-password") as typeof User.prototype | null
        if (!user) {
          return next(new Error("User not found"))
        }

        socket.data.user = user
        next()
      } catch {
        next(new Error("Authentication error"))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const userId = socket.data.user._id.toString()
      this.connectedUsers.set(userId, socket.id)

      console.log(`User ${socket.data.user.username} connected`)

      // Join user to their personal room for notifications
      socket.join(`user:${userId}`)
      socket.join(`user_${userId}`) // Alternative room format for follow updates

      // Handle joining conversation rooms
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`)
      })

      // Handle leaving conversation rooms
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
      })

      // Handle sending messages
      socket.on("send_message", async (data) => {
        try {
          const { recipientId, content, messageType = "text", fileUrl, fileName, fileSize, replyTo } = data

          const message = new Message({
            sender: userId,
            recipient: recipientId,
            content,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            replyTo,
          })

          await message.save()
          await message.populate([
            { path: "sender", select: "username displayName avatar" },
            { path: "recipient", select: "username displayName avatar" },
            { path: "replyTo", populate: { path: "sender", select: "username displayName" } },
          ])

          interface ParticipantsFilter {
            participants: { $all: string[] }
          }

          // Update or create conversation
          let conversation = await Conversation.findOne({
            participants: { $all: [userId, recipientId] },
          } as ParticipantsFilter)

          if (!conversation) {
            conversation = new Conversation({
              participants: [userId, recipientId],
              lastMessage: message._id,
              lastActivity: new Date(),
            })
          } else {
            conversation.lastMessage = message._id
            conversation.lastActivity = new Date()

            // Update unread count for recipient
            const currentUnread = conversation.unreadCount.get(recipientId) || 0
            conversation.unreadCount.set(recipientId, currentUnread + 1)
          }

          await conversation.save()

          // Emit to conversation room
          this.io.to(`conversation:${conversation._id}`).emit("new_message", {
            message,
            conversationId: conversation._id,
          })

          // Send notification to recipient if they're online
          const recipientSocketId = this.connectedUsers.get(recipientId)
          if (recipientSocketId) {
            this.io.to(`user:${recipientId}`).emit("new_notification", {
              type: "message",
              title: `New message from ${socket.data.user.displayName}`,
              message: content.substring(0, 100),
              sender: socket.data.user,
              createdAt: new Date(),
            })
          }

          // Create notification in database
          const notification = new Notification({
            recipient: recipientId,
            sender: userId,
            type: "message",
            title: `New message from ${socket.data.user.displayName}`,
            message: content.substring(0, 100),
            actionUrl: `/messages/${conversation._id}`,
          })
          await notification.save()
        } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Operation failed';
    console.error("Error sending message:", errorMessage)
          socket.emit("error", { message: "Failed to send message" })
        }
      })

      // Handle message reactions
      socket.on("add_reaction", async (data) => {
        try {
          const { messageId, emoji } = data

          const message = await Message.findById(messageId) as typeof Message.prototype | null
          if (!message) {
            return socket.emit("error", { message: "Message not found" })
          }

          // Remove existing reaction from this user
          message.reactions = message.reactions.filter((reaction: Record<string, unknown>) => reaction.user.toString() !== userId)

          // Add new reaction
          message.reactions.push({
            user: userId,
            emoji,
            createdAt: new Date(),
          })

          await message.save()
          await message.populate("reactions.user", "username displayName avatar")

          // Find conversation and emit to all participants
          const conversation = await Conversation.findOne({
            participants: { $all: [message.sender, message.recipient] },
          } as { participants: { $all: unknown[] } })

          if (conversation) {
            this.io.to(`conversation:${conversation._id}`).emit("message_reaction", {
              messageId,
              reactions: message.reactions,
            })
          }
        } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Operation failed';
    console.error("Error adding reaction:", errorMessage)
          socket.emit("error", { message: "Failed to add reaction" })
        }
      })

      // Handle marking messages as read
      socket.on("mark_as_read", async (data) => {
        try {
          const { messageIds } = data

          await Message.updateMany(
            {
              _id: { $in: messageIds },
              recipient: userId,
              "readBy.user": { $ne: userId },
            },
            {
              $push: {
                readBy: {
                  user: userId,
                  readAt: new Date(),
                },
              },
            },
          )

          interface MessageIdsFilter {
            _id: { $in: string[] }
          }

          interface MessageParticipantsFilter {
            participants: { $all: unknown[] }
          }

          // Update conversation unread count
          const messages = await Message.find({ _id: { $in: messageIds } } as MessageIdsFilter)
          for (const message of messages) {
            const conversation = await Conversation.findOne({
              participants: { $all: [message.sender, message.recipient] },
            } as MessageParticipantsFilter)

            if (conversation) {
              const currentUnread = conversation.unreadCount.get(userId) || 0
              conversation.unreadCount.set(userId, Math.max(0, currentUnread - 1))
              await conversation.save()

              // Emit read receipt to sender
              const senderSocketId = this.connectedUsers.get(message.sender.toString())
              if (senderSocketId) {
                this.io.to(`user:${message.sender}`).emit("message_read", {
                  messageId: message._id,
                  readBy: userId,
                  readAt: new Date(),
                })
              }
            }
          }
        } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Operation failed';
    console.error("Error marking messages as read:", errorMessage)
        }
      })

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        const { conversationId } = data
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          userId,
          username: socket.data.user.username,
          isTyping: true,
        })
      })

      socket.on("typing_stop", (data) => {
        const { conversationId } = data
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          userId,
          username: socket.data.user.username,
          isTyping: false,
        })
      })

      // Handle real-time post interactions
      socket.on("post_liked", (data) => {
        const { postId, authorId, likesCount } = data

        // Emit to post author if they're online
        this.io.to(`user:${authorId}`).emit("post_interaction", {
          type: "like",
          postId,
          likesCount,
          user: socket.data.user,
        })
      })

      socket.on("post_commented", (data) => {
        const { postId, authorId, commentsCount, comment } = data

        // Emit to post author if they're online
        this.io.to(`user:${authorId}`).emit("post_interaction", {
          type: "comment",
          postId,
          commentsCount,
          comment,
          user: socket.data.user,
        })
      })

      // Handle follow actions
      socket.on("follow_action", async (data) => {
        try {
          const { targetUserId, action, followerId } = data
          
          // Get updated user data
          const targetUser = await User.findById(targetUserId) as typeof User.prototype | null
          if (!targetUser) return

          const isFollowing = action === 'follow'
          
          // Emit to both users for real-time updates
          this.io.to(`user_${targetUserId}`).emit("follow_update", {
            userId: targetUserId,
            followerId,
            isFollowing,
            followersCount: targetUser.followersCount
          })
          
          this.io.to(`user_${followerId}`).emit("follow_update", {
            userId: targetUserId,
            followerId,
            isFollowing,
            followersCount: targetUser.followersCount
          })
        } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Operation failed';
    console.error('Error handling follow action:', errorMessage)
        }
      })

      // Handle joining user room
      socket.on("join_user_room", (userId: string) => {
        socket.join(`user_${userId}`)
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        this.connectedUsers.delete(userId)
        console.log(`User ${socket.data.user.username} disconnected`)
      })
    })
  }

  // Method to send notification to specific user
  public sendNotificationToUser(userId: string, notification: unknown) {
    this.io.to(`user:${userId}`).emit("new_notification", notification)
  }

  // Method to broadcast to all connected users
  public broadcast(event: string, data: unknown) {
    this.io.emit(event, data)
  }

  // Method to send to specific conversation
  public sendToConversation(conversationId: string, event: string, data: unknown) {
    this.io.to(`conversation:${conversationId}`).emit(event, data)
  }
}

let wsServer: WebSocketServer | null = null

export const initializeWebSocket = (server: HTTPServer) => {
  if (!wsServer) {
    wsServer = new WebSocketServer(server)
  }
  return wsServer
}

export const getWebSocketServer = () => wsServer
