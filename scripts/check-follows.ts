import mongoose from 'mongoose';
import User from '../models/User';
import Follow from '../models/Follow';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function checkFollows() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check total Follow documents
    const totalFollows = await Follow.countDocuments();
    console.log(`Total Follow documents: ${totalFollows}`);

    // Get all Follow documents
    const follows = await Follow.find({})
      .populate('follower', 'username')
      .populate('following', 'username')
      .lean();

    console.log('All Follow relationships:');
    follows.forEach((follow: any) => {
      console.log(`${follow.follower?.username || 'Unknown'} follows ${follow.following?.username || 'Unknown'}`);
    });

    // Check AkDavid specifically
    const akDavid = await User.findOne({ username: 'AkDavid' });
    if (akDavid) {
      console.log(`\nAkDavid ID: ${akDavid._id}`);
      
      const akDavidFollowers = await Follow.find({ following: akDavid._id })
        .populate('follower', 'username')
        .lean();
      
      const akDavidFollowing = await Follow.find({ follower: akDavid._id })
        .populate('following', 'username')
        .lean();

      console.log(`AkDavid followers: ${akDavidFollowers.length}`);
      akDavidFollowers.forEach((follow: any) => {
        console.log(`  - ${follow.follower?.username || 'Unknown'}`);
      });

      console.log(`AkDavid following: ${akDavidFollowing.length}`);
      akDavidFollowing.forEach((follow: any) => {
        console.log(`  - ${follow.following?.username || 'Unknown'}`);
      });

      // Check User document follow counts
      console.log(`\nUser document followersCount: ${akDavid.followersCount || 'undefined'}`);
      console.log(`User document followingCount: ${akDavid.followingCount || 'undefined'}`);
    }

  } catch (error) {
    console.error('Error checking follows:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkFollows();
}

export default checkFollows;