import { NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Post from "@/models/Post"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { postId, optionIds } = await req.json()

    if (!postId || !optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
    }

    await dbConnect()

    const post = await Post.findById(postId)
    if (!post || !post.poll) {
      return NextResponse.json({ success: false, message: "Poll not found" }, { status: 404 })
    }

    if (post.poll.endsAt && new Date(post.poll.endsAt) < new Date()) {
      return NextResponse.json({ success: false, message: "Poll has ended" }, { status: 400 })
    }

    const hasVoted = post.poll.options.some((opt: any) => opt.voters.includes(session.user.id))
    if (hasVoted) {
      return NextResponse.json({ success: false, message: "Already voted" }, { status: 400 })
    }

    const validOptionIds = post.poll.options.map((opt: any) => opt.id)
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id))
    if (invalidOptions.length > 0) {
      return NextResponse.json({ success: false, message: "Invalid option IDs" }, { status: 400 })
    }

    if (!post.poll.settings.multipleChoice && optionIds.length > 1) {
      return NextResponse.json({ success: false, message: "Single choice only" }, { status: 400 })
    }

    if (post.poll.settings.multipleChoice && optionIds.length > post.poll.settings.maxChoices) {
      return NextResponse.json({ success: false, message: "Too many choices" }, { status: 400 })
    }

    post.poll.options = post.poll.options.map((opt: any) => {
      if (optionIds.includes(opt.id)) {
        return {
          ...opt,
          votes: opt.votes + 1,
          voters: [...opt.voters, session.user.id],
        }
      }
      return opt
    })

    post.poll.totalVotes += 1
    await post.save()

    await User.findByIdAndUpdate(session.user.id, { $inc: { xp: 5 } })

    return NextResponse.json({
      success: true,
      data: { poll: post.poll, xpAwarded: 5 },
    })
  } catch (error: any) {
    console.error("Vote error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
