import connectDB from "@/lib/db"
import User from "@/models/User"
import Referral from "@/models/Referral"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"

async function testReferralFlow() {
  try {
    await connectDB()
    
    console.log("=== Testing Referral Flow ===")
    
    // 1. Find a user with a referral code
    const referrerUser = await User.findOne({ referralCode: { $exists: true, $ne: null } })
    if (!referrerUser) {
      console.log("No users with referral codes found")
      return
    }
    
    console.log(`Found referrer: ${referrerUser.username} with code: ${referrerUser.referralCode}`)
    
    // 2. Test referral code validation
    const validation = await ReferralSystemFixed.validateReferralCode(referrerUser.referralCode)
    console.log(`Referral code validation:`, validation)
    
    // 3. Check existing referrals for this user
    const existingReferrals = await Referral.find({ referrer: referrerUser._id })
      .populate('referred', 'username registrationSource referrer')
    
    console.log(`\nExisting referrals for ${referrerUser.username}:`)
    existingReferrals.forEach((ref, index) => {
      const referred = ref.referred as any
      console.log(`${index + 1}. ${referred.username} - Status: ${ref.status}`)
      console.log(`   Registration Source: ${referred.registrationSource}`)
      console.log(`   Referrer Field: "${referred.referrer}"`)
      console.log(`   Created: ${ref.createdAt}`)
      console.log(`   Completed: ${ref.completedAt || 'Not completed'}`)
      console.log(`   ---`)
    })
    
    // 4. Check for users who might have been referred but don't show up
    const usersWithDirectRegistration = await User.find({
      registrationSource: 'direct',
      referrer: '',
      createdAt: { $gte: new Date('2024-01-01') }
    }).limit(10)
    
    console.log(`\nUsers with direct registration (might be missing referrals):`)
    usersWithDirectRegistration.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Created: ${user.createdAt}`)
    })
    
    // 5. Test the referral link format
    const referralLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?ref=${referrerUser.referralCode}`
    console.log(`\nReferral link format: ${referralLink}`)
    
    // 6. Check referral stats
    const stats = await ReferralSystemFixed.getReferralStats(referrerUser._id.toString())
    console.log(`\nReferral stats for ${referrerUser.username}:`, JSON.stringify(stats, null, 2))
    
  } catch (error) {
    console.error("Error testing referral flow:", error)
  }
}

// Run the test
testReferralFlow().then(() => {
  console.log("\nTest completed")
  process.exit(0)
}).catch((error) => {
  console.error("Test failed:", error)
  process.exit(1)
})