import mongoose from 'mongoose';
import User from '../models/User';
import Follow from '../models/Follow';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function createTestFollows() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find AkDavid
    const akDavid = await User.findOne({ username: 'AkDavid' });
    if (!akDavid) {
      console.log('AkDavid not found');
      return;
    }

    console.log(`AkDavid ID: ${akDavid._id}`);

    // Create some test users to follow AkDavid
    const testUsers = [
      { username: 'testuser1', email: 'test1@example.com', password: 'password123' },
      { username: 'testuser2', email: 'test2@example.com', password: 'password123' },
      { username: 'testuser3', email: 'test3@example.com', password: 'password123' },
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      // Check if user already exists
      let user = await User.findOne({ username: userData.username });
      if (!user) {
        user = await User.create({
          ...userData,
          bio: `Test user ${userData.username}`,
          affiliation: 'Test University',
          displayName: userData.username.charAt(0).toUpperCase() + userData.username.slice(1)
        });
        console.log(`Created test user: ${user.username}`);
      } else {
        console.log(`Test user already exists: ${user.username}`);
      }
      createdUsers.push(user);
    }

    // Create follow relationships (test users follow AkDavid)
    for (const user of createdUsers) {
      const existingFollow = await Follow.findOne({
        follower: user._id,
        following: akDavid._id
      });

      if (!existingFollow) {
        await Follow.create({
          follower: user._id,
          following: akDavid._id
        });
        console.log(`${user.username} now follows AkDavid`);
      } else {
        console.log(`${user.username} already follows AkDavid`);
      }
    }

    // Update follow counts
    const followersCount = await Follow.countDocuments({ following: akDavid._id });
    const followingCount = await Follow.countDocuments({ follower: akDavid._id });

    await User.findByIdAndUpdate(akDavid._id, {
      followersCount,
      followingCount
    });

    console.log(`\nUpdated AkDavid: ${followersCount} followers, ${followingCount} following`);

    // Verify the data
    const updatedAkDavid = await User.findById(akDavid._id).select('username followersCount followingCount');
    console.log('Updated AkDavid data:', updatedAkDavid);

  } catch (error: unknown) {
    console.error('Error creating test follows:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestFollows();
}

export default createTestFollows;