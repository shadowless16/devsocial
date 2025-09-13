const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  avatar: String,
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  level: { type: Number, default: 1 },
  points: { type: Number, default: 10 }
}, { timestamps: true });

async function verifyTestUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if test users exist
    const testUsers = ['testadmin', 'testuser', 'testreporter'];
    
    for (const username of testUsers) {
      const user = await User.findOne({ username });
      if (user) {
        console.log(`✅ Found user: ${username} (${user.email}) - Role: ${user.role}`);
        
        // Test password verification
        const isValidPassword = await bcrypt.compare('password123', user.password);
        console.log(`   Password check: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      } else {
        console.log(`❌ User not found: ${username}`);
      }
    }

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // Show all users (for debugging)
    const allUsers = await User.find({}, 'username email role').limit(10);
    console.log('\n👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`   ${user.username} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function makeUserAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Find your actual user (replace with your username)
    const username = process.argv[3] || 'AkDavid'; // Default to AkDavid, or pass as argument
    
    const user = await User.findOne({ username });
    if (user) {
      await User.findByIdAndUpdate(user._id, { role: 'admin' });
      console.log(`✅ Made ${username} an admin!`);
    } else {
      console.log(`❌ User ${username} not found`);
      console.log('Available users:');
      const users = await User.find({}, 'username').limit(5);
      users.forEach(u => console.log(`   ${u.username}`));
    }
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifyTestUsers();
  } else if (command === 'make-admin') {
    makeUserAdmin();
  } else {
    console.log('Usage:');
    console.log('node verify-test-user.js verify           - Check test users');
    console.log('node verify-test-user.js make-admin [username] - Make user admin');
  }
}