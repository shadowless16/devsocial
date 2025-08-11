const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

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

const User = mongoose.model('User', UserSchema);

async function checkUserRole() {
  try {
    require('dotenv').config({ path: '.env.local' });
    await mongoose.connect(MONGODB_URI);
    
    const user = await User.findOne({ username: 'AkDavid' });
    if (user) {
      console.log(`✅ User ${user.username} has role: ${user.role}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 ID: ${user._id}`);
    } else {
      console.log('❌ User AkDavid not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserRole();