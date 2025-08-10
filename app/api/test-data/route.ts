import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import User from "@/models/User"

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await connectDB()
    
    // Find any user to use as author
    const user = await User.findOne()
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "No users found. Please create a user first."
      }, { status: 400 })
    }

    // Sample posts with tags
    const samplePosts = [
      {
        content: "Just built an amazing React component with TypeScript! 🚀 The type safety really helps catch bugs early.",
        tags: ["react", "typescript", "webdev", "frontend"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 20) + 5,
        commentsCount: Math.floor(Math.random() * 10) + 2,
        viewsCount: Math.floor(Math.random() * 100) + 20
      },
      {
        content: "Learning Python for data science. The pandas library is incredibly powerful for data manipulation! 🐍📊",
        tags: ["python", "datascience", "pandas", "learning"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 15) + 3,
        commentsCount: Math.floor(Math.random() * 8) + 1,
        viewsCount: Math.floor(Math.random() * 80) + 15
      },
      {
        content: "Deployed my first Next.js app to Vercel today! The developer experience is fantastic. 🎉",
        tags: ["nextjs", "vercel", "deployment", "webdev"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 25) + 8,
        commentsCount: Math.floor(Math.random() * 12) + 3,
        viewsCount: Math.floor(Math.random() * 120) + 30
      },
      {
        content: "Working on a machine learning project with TensorFlow. AI is the future! 🤖",
        tags: ["ai", "tensorflow", "machinelearning", "python"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 30) + 10,
        commentsCount: Math.floor(Math.random() * 15) + 4,
        viewsCount: Math.floor(Math.random() * 150) + 40
      },
      {
        content: "Tips for clean code: Use meaningful variable names, keep functions small, and write tests! 💡",
        tags: ["cleancode", "tips", "bestpractices", "programming"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 18) + 6,
        commentsCount: Math.floor(Math.random() * 9) + 2,
        viewsCount: Math.floor(Math.random() * 90) + 25
      },
      {
        content: "Just discovered Tailwind CSS and I'm loving the utility-first approach! 🎨",
        tags: ["tailwind", "css", "frontend", "webdev"],
        author: user._id,
        likesCount: Math.floor(Math.random() * 22) + 7,
        commentsCount: Math.floor(Math.random() * 11) + 3,
        viewsCount: Math.floor(Math.random() * 110) + 35
      }
    ]

    // Create posts
    const createdPosts = await Post.insertMany(samplePosts)
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdPosts.length} sample posts with tags`,
      data: {
        postsCreated: createdPosts.length,
        tags: [...new Set(samplePosts.flatMap(post => post.tags))]
      }
    })
  } catch (error: any) {
    console.error("Error creating test data:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to create test data",
      error: error.message
    }, { status: 500 })
  }
}