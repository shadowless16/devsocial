import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Message from "@/models/Message"
import connectDB from "@/lib/core/db"
import { successResponse, errorResponse } from "@/utils/response"
import mongoose from "mongoose"


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { messageId } = await params
    const { emoji } = await request.json()

    const message = await Message.findById(messageId)
    if (!message) {
      return NextResponse.json(errorResponse("Message not found"), { status: 404 })
    }

    // Check if user is part of this conversation
    if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 403 })
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter((reaction: { user: mongoose.Types.ObjectId; emoji: string; createdAt: Date }) => reaction.user.toString() !== userId)

    // Add new reaction
    message.reactions.push({
      user: userId as any,
      emoji,
      createdAt: new Date(),
    })

    await message.save()
    await message.populate("reactions.user", "username displayName avatar")

    return NextResponse.json(
      successResponse({
        messageId,
        reactions: message.reactions,
      }),
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error adding reaction:", errorMessage)
    return NextResponse.json(errorResponse("Failed to add reaction"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { messageId } = await params
    const { searchParams } = new URL(request.url)
    const emoji = searchParams.get("emoji")

    const message = await Message.findById(messageId)
    if (!message) {
      return NextResponse.json(errorResponse("Message not found"), { status: 404 })
    }

    // Check if user is part of this conversation
    if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 403 })
    }

    // Remove reaction
    message.reactions = message.reactions.filter(
      (reaction: { user: mongoose.Types.ObjectId; emoji: string; createdAt: Date }) => !(reaction.user.toString() === userId && reaction.emoji === emoji),
    )

    await message.save()
    await message.populate("reactions.user", "username displayName avatar")

    return NextResponse.json(
      successResponse({
        messageId,
        reactions: message.reactions,
      }),
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error removing reaction:", errorMessage)
    return NextResponse.json(errorResponse("Failed to remove reaction"), { status: 500 })
  }
}
