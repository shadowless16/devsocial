import connectDB from "@/lib/db"
import User from "@/models/User"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import { AuthService } from "@/lib/auth"

const sampleUsers = [
  {
    username: "alexdev",
    email: "alex@example.com",
    password: "Password123!",
    bio: "Full-stack developer passionate about React and Node.js",
    branch: "NIIT Lagos",
    points: 2500,
    level: 3,
    badges: ["newcomer", "first_post", "helpful"],
    isVerified: true,
  },
  {
    username: "sarahcode",
    email: "sarah@example.com",
    password: "Password123!",
    bio: "Backend engineer specializing in Python and databases",
    branch: "NIIT Abuja",
    points: 3200,
    level: 4,
    badges: ["newcomer", "first_post", "mentor", "problem_solver"],
    isVerified: true,
  },
  {
    username: "mikejs",
    email: "mike@example.com",
    password: "Password123!",
    bio: "JavaScript enthusiast and open source contributor",
    branch: "NIIT Yaba",
    points: 1800,
    level: 2,
    badges: ["newcomer", "first_post"],
    isVerified: true,
  },
  {
    username: "techguru",
    email: "guru@example.com",
    password: "Password123!",
    bio: "Senior developer with 10+ years experience",
    branch: "Other",
    points: 5000,
    level: 6,
    badges: ["newcomer", "first_post", "mentor", "expert", "leader"],
    isVerified: true,
    role: "moderator" as const,
  },
]

const samplePosts = [
  {
    content:
      "Just finished building my first REST API with Express.js! The feeling of seeing all endpoints work perfectly is incredible. What was your first major coding milestone?",
    tags: ["#javascript", "#nodejs", "#api", "#milestone"],
    isAnonymous: false,
    xpAwarded: 25,
  },
  {
    content:
      "Struggling with async/await vs Promises. Can someone explain when to use each? I keep getting confused about the syntax differences.",
    tags: ["#javascript", "#async", "#help"],
    isAnonymous: false,
    xpAwarded: 20,
  },
  {
    content:
      "Hot take: Learning algorithms and data structures is more important than learning the latest framework. Change my mind! 🔥",
    tags: ["#algorithms", "#datastructures", "#opinion"],
    isAnonymous: false,
    xpAwarded: 30,
  },
  {
    content:
      "I made a huge mistake in production today... accidentally deleted a table. Thank goodness for backups! Always backup your data, folks.",
    tags: ["#database", "#backup", "#lessons"],
    isAnonymous: true,
    xpAwarded: 35,
  },
  {
    content:
      "Just got my first job offer as a junior developer! 🎉 Thank you to this community for all the help and support. Here's what I learned during my job search...",
    tags: ["#career", "#job", "#success"],
    isAnonymous: false,
    xpAwarded: 40,
  },
]

const sampleComments = [
  "Congratulations! That's a huge achievement. Keep building!",
  "I remember my first API too. The satisfaction is unmatched!",
  "async/await is just syntactic sugar over Promises. Use async/await for cleaner code.",
  "Promises are better when you need to handle multiple async operations.",
  "I totally agree! Fundamentals are way more important than frameworks.",
  "Frameworks come and go, but good problem-solving skills last forever.",
  "We've all been there! Mistakes are how we learn.",
  "That's why we have staging environments 😅",
  "Amazing news! You deserve it after all the hard work.",
  "Your journey is inspiring. Thanks for sharing!",
]

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    await connectDB()

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await User.deleteMany({})
    await Post.deleteMany({})
    await Comment.deleteMany({})

    // Create users
    console.log("👥 Creating users...")
    const createdUsers = []

    for (const userData of sampleUsers) {
      const hashedPassword = await AuthService.hashPassword(userData.password)
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      })
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.username}`)
    }

    // Create posts
    console.log("📝 Creating posts...")
    const createdPosts = []

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i]
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]

      const post = await Post.create({
        ...postData,
        author: randomUser._id,
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 10),
      })

      createdPosts.push(post)
      console.log(`✅ Created post: ${post.content.substring(0, 50)}...`)
    }

    // Create comments
    console.log("💬 Creating comments...")

    for (const post of createdPosts) {
      const numComments = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < numComments; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]

        await Comment.create({
          author: randomUser._id,
          post: post._id,
          content: randomComment,
          likesCount: Math.floor(Math.random() * 20),
        })
      }

      // Update post comment count
      const actualCommentCount = await Comment.countDocuments({ post: post._id })
      await Post.findByIdAndUpdate(post._id, { commentsCount: actualCommentCount })
    }

    console.log("🎉 Database seeding completed successfully!")
    console.log(`📊 Created: ${createdUsers.length} users, ${createdPosts.length} posts`)
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error)
      process.exit(1)
    })
}
