import connectDB from "@/lib/db"
import Tag from "@/models/Tag"
import User from "@/models/User"

const sampleTags = [
  { name: "JavaScript", color: "#f7df1e", description: "JavaScript programming language" },
  { name: "React", color: "#61dafb", description: "React library for building UIs" },
  { name: "TypeScript", color: "#3178c6", description: "TypeScript programming language" },
  { name: "Node.js", color: "#339933", description: "Node.js runtime environment" },
  { name: "Python", color: "#3776ab", description: "Python programming language" },
  { name: "Frontend", color: "#ff6b6b", description: "Frontend development" },
  { name: "Backend", color: "#4ecdc4", description: "Backend development" },
  { name: "DevOps", color: "#ff9f43", description: "DevOps practices and tools" },
  { name: "AI", color: "#6c5ce7", description: "Artificial Intelligence" },
  { name: "WebDev", color: "#fd79a8", description: "Web development" },
  { name: "Mobile", color: "#00b894", description: "Mobile app development" },
  { name: "Tutorial", color: "#fdcb6e", description: "Educational content" },
  { name: "OpenSource", color: "#e17055", description: "Open source projects" },
  { name: "Career", color: "#74b9ff", description: "Career advice and tips" },
  { name: "Beginner", color: "#55a3ff", description: "Beginner-friendly content" }
]

async function seedTags() {
  try {
    await connectDB()
    
    const akDavid = await User.findOne({ username: "AkDavid" })
    if (!akDavid) {
      console.error("AkDavid user not found")
      return
    }

    await Tag.deleteMany({})
    console.log("Cleared existing tags")

    const tags = sampleTags.map(tag => ({
      ...tag,
      slug: tag.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      isOfficial: true,
      createdBy: akDavid._id
    }))

    const createdTags = await Tag.insertMany(tags)
    console.log(`Created ${createdTags.length} sample tags`)

    console.log("Tags seeded successfully!")
  } catch (error) {
    console.error("Error seeding tags:", error)
  }
}

if (require.main === module) {
  seedTags().then(() => process.exit(0))
}

export default seedTags