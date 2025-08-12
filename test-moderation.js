const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
require('dotenv').config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

// User Schema
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

// Post Schema
const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

// Report Schema
const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'],
    required: true 
  },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  action: { 
    type: String, 
    enum: ['none', 'warning', 'post_removed', 'user_suspended', 'user_banned'] 
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Report = mongoose.model('Report', ReportSchema);

async function setupTestData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    console.log('🧹 Cleaning up existing test data...');
    await Report.deleteMany({});
    await Post.deleteMany({ content: { $regex: /test/i } });
    await User.deleteMany({ username: { $regex: /test/i } });

    // Create test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = await User.create({
      username: 'testadmin',
      email: 'admin@test.com',
      password: hashedPassword,
      displayName: 'Test Admin',
      role: 'admin',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testadmin'
    });

    const regularUser = await User.create({
      username: 'testuser',
      email: 'user@test.com',
      password: hashedPassword,
      displayName: 'Test User',
      role: 'user',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testuser'
    });

    const reporterUser = await User.create({
      username: 'testreporter',
      email: 'reporter@test.com',
      password: hashedPassword,
      displayName: 'Test Reporter',
      role: 'user',
      avatar: 'https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.glb?seed=testreporter'
    });

    // Create test posts
    console.log('📝 Creating test posts...');
    const spamPost = await Post.create({
      content: 'BUY NOW! AMAZING DEAL! CLICK HERE! 🚨🚨🚨 LIMITED TIME OFFER!!!',
      author: regularUser._id
    });

    const inappropriatePost = await Post.create({
      content: 'This is some inappropriate content that should be reported for moderation testing.',
      author: regularUser._id
    });

    const normalPost = await Post.create({
      content: 'This is a normal post about coding and development. Nothing wrong here!',
      author: regularUser._id
    });

    // Create test reports
    console.log('🚨 Creating test reports...');
    await Report.create({
      reporter: reporterUser._id,
      reportedPost: spamPost._id,
      reportedUser: regularUser._id,
      reason: 'spam',
      description: 'This post is clearly spam with excessive promotional content and emojis.',
      status: 'pending'
    });

    await Report.create({
      reporter: reporterUser._id,
      reportedPost: inappropriatePost._id,
      reportedUser: regularUser._id,
      reason: 'inappropriate',
      description: 'This content is inappropriate for our platform.',
      status: 'pending'
    });

    await Report.create({
      reporter: adminUser._id,
      reportedPost: normalPost._id,
      reportedUser: regularUser._id,
      reason: 'other',
      description: 'Testing the moderation system - this should be dismissed.',
      status: 'dismissed',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(),
      action: 'none'
    });

    console.log('✅ Test data created successfully!');
    console.log('\n📊 Test Data Summary:');
    console.log(`👤 Admin User: ${adminUser.username} (${adminUser.email})`);
    console.log(`👤 Regular User: ${regularUser.username} (${regularUser.email})`);
    console.log(`👤 Reporter User: ${reporterUser.username} (${reporterUser.email})`);
    console.log(`📝 Posts Created: ${await Post.countDocuments()}`);
    console.log(`🚨 Reports Created: ${await Report.countDocuments()}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: testadmin / password123');
    console.log('User: testuser / password123');
    console.log('Reporter: testreporter / password123');

    console.log('\n🧪 Test Instructions:');
    console.log('1. Login as testadmin to access moderation dashboard');
    console.log('2. Go to /moderation to see pending reports');
    console.log('3. Test different actions: dismiss, warning, remove post');
    console.log('4. Login as testreporter to create more reports');
    console.log('5. Login as testuser to see posts and get reported');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function testModerationAPI() {
  try {
    console.log('\n🧪 Testing Moderation API Endpoints...');
    
    // Test data would be tested via HTTP requests in a real scenario
    // For now, we'll just verify the data exists
    await mongoose.connect(MONGODB_URI);
    
    const pendingReports = await Report.find({ status: 'pending' }).populate('reporter reportedUser reportedPost');
    console.log(`📊 Pending Reports: ${pendingReports.length}`);
    
    const resolvedReports = await Report.find({ status: 'resolved' }).populate('reporter reportedUser reportedPost');
    console.log(`📊 Resolved Reports: ${resolvedReports.length}`);
    
    console.log('\n✅ API endpoints ready for testing:');
    console.log('GET /api/reports?status=pending');
    console.log('GET /api/reports?status=resolved');
    console.log('POST /api/reports (create new report)');
    console.log('PUT /api/reports/[id] (update report status)');
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the setup
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    setupTestData();
  } else if (command === 'test') {
    testModerationAPI();
  } else {
    console.log('Usage:');
    console.log('node test-moderation.js setup  - Create test data');
    console.log('node test-moderation.js test   - Test API endpoints');
  }
}

// # First, verify the test users exist
// node verify-test-user.js verify

// # If login still fails, make your real user an admin
// node verify-test-user.js make-admin YourActualUsername

// # Then try the additional test reports
// node test-report-creation.js create
