import mongoose from 'mongoose';
import User from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function checkUserFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get AkDavid user with all fields
    const akDavid = await User.findOne({ username: 'AkDavid' }).lean();
    
    if (akDavid) {
      console.log('AkDavid user document:');
      console.log(JSON.stringify(akDavid, null, 2));
    } else {
      console.log('AkDavid user not found');
    }

    // Check all users and their follow-related fields
    const allUsers = await User.find({}).select('username followersCount followingCount').lean();
    console.log('\nAll users follow counts:');
    allUsers.forEach(user => {
      console.log(`${user.username}: followers=${user.followersCount || 'undefined'}, following=${user.followingCount || 'undefined'}`);
    });

  } catch (error) {
    console.error('Error checking user fields:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkUserFields();
}

export default checkUserFields;