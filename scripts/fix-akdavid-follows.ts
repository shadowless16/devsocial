import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"

async function fixAkDavidFollows() {
  try {
    await connectDB()
    
    // Find AkDavid user
    const akDavid = await User.findOne({ username: "AkDavid" })
    if (!akDavid) {
      console.error("AkDavid user not found")
      return
    }

    console.log(`Found AkDavid: ${akDavid._id}`)

    // Get all users except AkDavid
    const allUsers = await User.find({ 
      _id: { $ne: akDavid._id } 
    }).select("_id username")

    console.log(`Found ${allUsers.length} users to process`)

    let followsCreated = 0
    let alreadyFollowing = 0

    for (const user of allUsers) {
      try {
        // Check if already following
        const existingFollow = await Follow.findOne({
          follower: user._id,
          following: akDavid._id
        })

        if (!existingFollow) {
          await Follow.create({
            follower: user._id,
            following: akDavid._id
          })
          followsCreated++
          console.log(`✓ ${user.username} now follows AkDavid`)
        } else {
          alreadyFollowing++
        }
      } catch (error: unknown) {
        console.error(`Error processing ${user.username}:`, error)
      }
    }

    console.log(`\nSummary:`)
    console.log(`- New follows created: ${followsCreated}`)
    console.log(`- Already following: ${alreadyFollowing}`)
    console.log(`- Total users processed: ${allUsers.length}`)
    
  } catch (error: unknown) {
    console.error("Error fixing AkDavid follows:", error)
  }
}

if (require.main === module) {
  fixAkDavidFollows().then(() => process.exit(0))
}

export default fixAkDavidFollows