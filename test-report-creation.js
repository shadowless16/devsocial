const mongoose = require('mongoose');

// Schema definitions
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

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

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

// Test creating reports via API simulation
async function testReportCreation() {
  require('dotenv').config({ path: '.env.local' });
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to test database');

    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
    const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

    const reporter = await User.findOne({ username: 'testreporter' });
    const targetUser = await User.findOne({ username: 'testuser' });
    const posts = await Post.find({ author: targetUser._id });

    if (!reporter || !targetUser || posts.length === 0) {
      console.log('❌ Test data not found. Run setup first: node test-moderation.js setup');
      return;
    }

    console.log('📝 Creating additional test reports...');

    // Create various types of reports
    const reportTypes = [
      {
        reason: 'harassment',
        description: 'This user is being aggressive and hostile in their comments.'
      },
      {
        reason: 'misinformation',
        description: 'This post contains false information about coding practices.'
      },
      {
        reason: 'copyright',
        description: 'This code appears to be copied from a proprietary source without permission.'
      }
    ];

    for (let i = 0; i < reportTypes.length && i < posts.length; i++) {
      const reportData = reportTypes[i];
      const post = posts[i];

      await Report.create({
        reporter: reporter._id,
        reportedPost: post._id,
        reportedUser: targetUser._id,
        reason: reportData.reason,
        description: reportData.description,
        status: 'pending'
      });

      console.log(`✅ Created ${reportData.reason} report`);
    }

    // Create a report that's already been reviewed
    if (posts.length > 3) {
      const admin = await User.findOne({ role: 'admin' });
      await Report.create({
        reporter: reporter._id,
        reportedPost: posts[3]._id,
        reportedUser: targetUser._id,
        reason: 'spam',
        description: 'Automated spam detection triggered.',
        status: 'dismissed',
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        action: 'none'
      });
      console.log('✅ Created dismissed report');
    }

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    console.log(`\n📊 Report Statistics:`);
    console.log(`Total Reports: ${totalReports}`);
    console.log(`Pending Reports: ${pendingReports}`);
    console.log(`Resolved Reports: ${totalReports - pendingReports}`);

    console.log('\n🎯 Test Scenarios Created:');
    console.log('1. Multiple pending reports with different reasons');
    console.log('2. Reports with detailed descriptions');
    console.log('3. Mix of pending and resolved reports');
    console.log('4. Reports from different users');

  } catch (error) {
    console.error('❌ Error creating test reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Test the report API endpoints
async function testReportAPI() {
  console.log('\n🌐 Testing Report API Endpoints...');
  console.log('Note: These would be actual HTTP requests in a real test');
  
  const testCases = [
    {
      method: 'GET',
      endpoint: '/api/reports?status=pending',
      description: 'Fetch pending reports'
    },
    {
      method: 'GET', 
      endpoint: '/api/reports?status=resolved',
      description: 'Fetch resolved reports'
    },
    {
      method: 'POST',
      endpoint: '/api/reports',
      description: 'Create new report',
      body: {
        postId: 'test-post-id',
        reason: 'spam',
        description: 'Test report creation'
      }
    },
    {
      method: 'PUT',
      endpoint: '/api/reports/test-report-id',
      description: 'Update report status',
      body: {
        action: 'warning',
        status: 'resolved'
      }
    }
  ];

  testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.description}`);
    console.log(`   ${test.method} ${test.endpoint}`);
    if (test.body) {
      console.log(`   Body: ${JSON.stringify(test.body, null, 2)}`);
    }
  });

  console.log('\n✅ API endpoints documented for manual testing');
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'create') {
    testReportCreation();
  } else if (command === 'api') {
    testReportAPI();
  } else {
    console.log('Usage:');
    console.log('node test-report-creation.js create  - Create additional test reports');
    console.log('node test-report-creation.js api     - Show API test cases');
  }
}