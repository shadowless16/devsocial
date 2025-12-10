import mongoose from 'mongoose';
import User from '../models/User';
import Follow from '../models/Follow';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function syncFollowCounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('_id username');
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Count followers
      const followersCount = await Follow.countDocuments({ following: user._id });
      
      // Count following
      const followingCount = await Follow.countDocuments({ follower: user._id });

      // Update user with correct counts
      await User.findByIdAndUpdate(user._id, {
        followersCount,
        followingCount
      });

      console.log(`Updated ${user.username}: ${followersCount} followers, ${followingCount} following`);
    }

    console.log('Follow counts synchronized successfully');
  } catch (error: unknown) {
    console.error('Error syncing follow counts:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  syncFollowCounts();
}

export default syncFollowCounts;