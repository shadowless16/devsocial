import connectDB from "@/lib/db"
import WeeklyChallenge from "@/models/WeeklyChallenge"
import User from "@/models/User"
import { sampleChallenges } from "@/utils/sample-challenges"

async function seedChallenges() {
  try {
    await connectDB()
    
    const akDavid = await User.findOne({ username: "AkDavid" })
    if (!akDavid) {
      console.error("AkDavid user not found")
      return
    }

    await WeeklyChallenge.deleteMany({})
    console.log("Cleared existing challenges")

    const now = new Date()
    const challenges = sampleChallenges.map(challenge => ({
      ...challenge,
      startDate: now,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      createdBy: akDavid._id
    }))

    const createdChallenges = await WeeklyChallenge.insertMany(challenges)
    console.log(`Created ${createdChallenges.length} sample challenges:`)
    
    createdChallenges.forEach(challenge => {
      console.log(`- ${challenge.title} (${challenge.difficulty}, ${challenge.experienceLevel})`)
    })

    console.log("\nChallenges seeded successfully!")
  } catch (error: unknown) {
    console.error("Error seeding challenges:", error)
  }
}

if (require.main === module) {
  seedChallenges().then(() => process.exit(0))
}

export default seedChallenges