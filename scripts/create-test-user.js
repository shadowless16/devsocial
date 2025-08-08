// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/devsocial-frontend', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // User Schema (simplified for this script)
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   bio: { type: String, default: '' },
//   branch: { type: String, default: 'Other' },
//   avatar: { type: String, default: '' },
//   bannerUrl: { type: String, default: '' },
//   role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
//   points: { type: Number, default: 10 },
//   badges: [{ type: String }],
//   level: { type: Number, default: 1 },
//   displayName: { type: String },
//   location: { type: String },
//   website: { type: String },
//   isVerified: { type: Boolean, default: false },
//   refreshTokens: [{ type: String }],
//   lastLogin: { type: Date },
//   loginStreak: { type: Number, default: 0 },
//   lastStreakDate: { type: Date },
// }, { timestamps: true });

// // Add pre-save middleware for level calculation and avatar
// userSchema.pre('save', function(next) {
//   if (this.isModified('points')) {
//     this.level = Math.floor(this.points / 1000) + 1;
//   }
  
//   if (this.isNew && !this.avatar) {
//     const avatarStyle = 'adventurer';
//     this.avatar = `https://api.dicebear.com/8.x/${avatarStyle}/svg?seed=${this.username}`;
//   }
  
//   next();
// });

// const User = mongoose.model('User', userSchema);

// async function createTestUser() {
//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email: 'test@example.com' }, { username: 'testuser' }] 
//     });
    
//     if (existingUser) {
//       console.log('Test user already exists!');
//       console.log('Email: test@example.com');
//       console.log('Username: testuser');
//       console.log('Password: password123');
//       return;
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash('password123', 12);

//     // Create test user
//     const testUser = new User({
//       username: 'testuser',
//       email: 'test@example.com',
//       password: hashedPassword,
//       bio: 'Test user for development',
//       branch: 'NIIT Lagos',
//       displayName: 'Test User',
//       location: 'Lagos, Nigeria',
//       points: 1500, // This will set level to 2
//       isVerified: true,
//     });

//     await testUser.save();
    
//     console.log('✅ Test user created successfully!');
//     console.log('📧 Email: test@example.com');
//     console.log('👤 Username: testuser');
//     console.log('🔑 Password: password123');
//     console.log('🏆 Level:', testUser.level);
//     console.log('💎 Points:', testUser.points);
    
//   } catch (error) {
//     console.error('❌ Error creating test user:', error);
//   } finally {
//     mongoose.connection.close();
//   }
// }

// // Run the script
// createTestUser();
