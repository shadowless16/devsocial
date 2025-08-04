// import { type NextRequest, NextResponse } from "next/server"
// import { authMiddleware } from "@/middleware/auth"
// import Message from "@/models/Message"
// import Conversation from "@/models/Conversation"
// import connectDB from "@/lib/db"
// import { successResponse, errorResponse } from "@/utils/response"

// export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
//   try {
//     await connectDB()

//     const authResult = await authMiddleware(request)
//     if (!authResult.success) {
//       return NextResponse.json(errorResponse(authResult.message), { status: 401 })
//     }

//     const userId = authResult.user!.id
//     const { conversationId } = params
//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const limit = Number.parseInt(searchParams.get("limit") || "50")
//     const skip = (page - 1) * limit

//     // Verify user is part of conversation
//     const conversation = await Conversation.findById(conversationId)
//     if (!conversation || !conversation.participants.includes(userId as any)) {
//       return NextResponse.json(errorResponse("Conversation not found"), { status: 404 })
//     }

//     const messages = await Message.find({
//       $or: [
//         { sender: userId, recipient: { $in: conversation.participants } },
//         { sender: { $in: conversation.participants }, recipient: userId },
//       ],
//       isDeleted: false,
//     })
//       .populate([
//         { path: "sender", select: "username displayName avatar" },
//         { path: "recipient", select: "username displayName avatar" },
//         {
//           path: "replyTo",
//           populate: { path: "sender", select: "username displayName" },
//         },
//         { path: "reactions.user", select: "username displayName avatar" },
//       ])
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)

//     const totalMessages = await Message.countDocuments({
//       $or: [
//         { sender: userId, recipient: { $in: conversation.participants } },
//         { sender: { $in: conversation.participants }, recipient: userId },
//       ],
//       isDeleted: false,
//     })

//     // Mark messages as read
//     await Message.updateMany(
//       {
//         recipient: userId,
//         sender: { $in: conversation.participants },
//         "readBy.user": { $ne: userId },
//       },
//       {
//         $push: {
//           readBy: {
//             user: userId,
//             readAt: new Date(),
//           },
//         },
//       },
//     )

//     // Update conversation unread count
//     conversation.unreadCount.set(userId, 0)
//     await conversation.save()

//     return NextResponse.json(
//       successResponse({
//         messages: messages.reverse(), // Reverse to show oldest first
//         conversation,
//         pagination: {
//           currentPage: page,
//           totalPages: Math.ceil(totalMessages / limit),
//           totalMessages,
//           hasMore: skip + messages.length < totalMessages,
//         },
//       }),
//     )
//   } catch (error) {
//     console.error("Error fetching messages:", error)
//     return NextResponse.json(errorResponse("Failed to fetch messages"), { status: 500 })
//   }
// }

// export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
//   try {
//     await connectDB()

//     const authResult = await authMiddleware(request)
//     if (!authResult.success) {
//       return NextResponse.json(errorResponse(authResult.message), { status: 401 })
//     }

//     const userId = authResult.user!.id
//     const { conversationId } = params
//     const body = await request.json()
//     const { content, messageType = "text", fileUrl, fileName, fileSize, replyTo } = body

//     // Verify user is part of conversation
//     const conversation = await Conversation.findById(conversationId)
//     if (!conversation || !conversation.participants.includes(userId as any)) {
//       return NextResponse.json(errorResponse("Conversation not found"), { status: 404 })
//     }

//     // Get recipient (other participant)
//     const recipientId = conversation.participants.find((p) => p.toString() !== userId)

//     const message = new Message({
//       sender: userId,
//       recipient: recipientId,
//       content,
//       messageType,
//       fileUrl,
//       fileName,
//       fileSize,
//       replyTo,
//     })

//     await message.save()
//     await message.populate([
//       { path: "sender", select: "username displayName avatar" },
//       { path: "recipient", select: "username displayName avatar" },
//       {
//         path: "replyTo",
//         populate: { path: "sender", select: "username displayName" },
//       },
//     ])

//     // Update conversation
//     conversation.lastMessage = message._id as any
//     conversation.lastActivity = new Date()

//     // Update unread count for recipient
//     const currentUnread = conversation.unreadCount.get(recipientId!.toString()) || 0
//     conversation.unreadCount.set(recipientId!.toString(), currentUnread + 1)
//     await conversation.save()

//     return NextResponse.json(successResponse({ message }), { status: 201 })
//   } catch (error) {
//     console.error("Error sending message:", error)
//     return NextResponse.json(errorResponse("Failed to send message"), { status: 500 })
//   }
// }
