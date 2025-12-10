import connectDB from '@/lib/db'
import User from '@/models/User'
import Follow from '@/models/Follow'

async function autoFollowAkDavid() {
  try {
    await connectDB()
    
    // Find AkDavid user
    const akDavid = await User.findOne({ username: 'AkDavid' })
    if (!akDavid) {
      console.log('AkDavid user not found')
      return
    }
    
    console.log('Found AkDavid:', akDavid.username)
    
    // Get all users except AkDavid
    const allUsers = await User.find({ 
      _id: { $ne: akDavid._id } 
    }).select('_id username')
    
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
          // Create follow relationship
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
        console.error(`Error processing user ${user.username}:`, error)
      }
    }
    
    console.log('\n=== Summary ===')
    console.log(`Total users processed: ${allUsers.length}`)
    console.log(`New follows created: ${followsCreated}`)
    console.log(`Already following: ${alreadyFollowing}`)
    
    // Update follower counts
    const totalFollowers = await Follow.countDocuments({ following: akDavid._id })
    await User.findByIdAndUpdate(akDavid._id, { followersCount: totalFollowers })
    
    console.log(`AkDavid now has ${totalFollowers} followers`)
    
  } catch (error: unknown) {
    console.error('Error in auto-follow script:', error)
  } finally {
    process.exit(0)
  }
}

autoFollowAkDavid()