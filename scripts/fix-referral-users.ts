import connectDB from "@/lib/db"
import User from "@/models/User"
import Referral from "@/models/Referral"

async function fixReferralUsers() {
  try {
    await connectDB()
    
    console.log("Starting to fix users with incorrect referral data...")
    
    // Find all referrals
    const referrals = await Referral.find({})
      .populate('referrer', 'username')
      .populate('referred', 'username registrationSource referrer')
    
    let fixedCount = 0
    
    for (const referral of referrals) {
      if (!referral.referred || !referral.referrer) {
        console.log(`Skipping referral ${referral._id} - missing user data`)
        continue
      }
      
      const referredUser = referral.referred as any
      const referrerUser = referral.referrer as any
      
      // Check if the referred user has incorrect registration data
      if (referredUser.registrationSource === 'direct' && referredUser.referrer === '') {
        console.log(`Fixing user ${referredUser.username} - setting referral data`)
        
        await User.findByIdAndUpdate(referredUser._id, {
          registrationSource: 'referral',
          referrer: referrerUser.username
        })
        
        fixedCount++
      }
    }
    
    console.log(`Fixed ${fixedCount} users with incorrect referral data`)
    
    // Also check for users who might have been referred but don't have a referral record
    const usersWithReferralCodes = await User.find({
      registrationSource: 'direct',
      referrer: '',
      createdAt: { $gte: new Date('2024-01-01') } // Only check recent users
    })
    
    console.log(`Found ${usersWithReferralCodes.length} users to check for missing referral records`)
    
  } catch (error: unknown) {
    console.error("Error fixing referral users:", error)
  }
}

// Run the script
fixReferralUsers().then(() => {
  console.log("Script completed")
  process.exit(0)
}).catch((error) => {
  console.error("Script failed:", error)
  process.exit(1)
})