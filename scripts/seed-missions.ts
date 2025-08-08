import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import User from "@/models/User"
import { sampleMissions } from "@/utils/sample-missions"

async function seedMissions() {
  try {
    await connectDB()
    
    // Find AkDavid user to set as creator
    const akDavid = await User.findOne({ username: "AkDavid" })
    if (!akDavid) {
      console.error("AkDavid user not found. Please create this user first.")
      return
    }

    // Clear existing missions
    await Mission.deleteMany({})
    console.log("Cleared existing missions")

    // Create sample missions
    const missions = sampleMissions.map(mission => ({
      ...mission,
      createdBy: akDavid._id
    }))

    const createdMissions = await Mission.insertMany(missions)
    console.log(`Created ${createdMissions.length} sample missions:`)
    
    createdMissions.forEach(mission => {
      console.log(`- ${mission.title} (${mission.type}, ${mission.difficulty})`)
    })

    console.log("\nMissions seeded successfully!")
  } catch (error) {
    console.error("Error seeding missions:", error)
  }
}

// Run if called directly
if (require.main === module) {
  seedMissions().then(() => process.exit(0))
}

export default seedMissions