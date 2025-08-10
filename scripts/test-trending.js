// Test script to check and create sample posts with tags
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Post schema (simplified)
const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

const testTrending = async () => {
  await connectDB();
  
  // Check existing posts with tags
  const postsWithTags = await Post.find({ tags: { $exists: true, $ne: [] } });
  console.log(`Found ${postsWithTags.length} posts with tags`);
  
  if (postsWithTags.length > 0) {
    console.log('Sample posts with tags:');
    postsWithTags.slice(0, 3).forEach(post => {
      console.log(`- "${post.content.substring(0, 50)}..." Tags: [${post.tags.join(', ')}]`);
    });
  }
  
  // Test trending aggregation
  const trendingTopics = await Post.aggregate([
    {
      $match: {
        tags: { $exists: true, $ne: [], $not: { $size: 0 } }
      },
    },
    { $unwind: "$tags" },
    {
      $match: {
        tags: { $ne: null, $ne: "" }
      }
    },
    {
      $group: {
        _id: "$tags",
        posts: { $sum: 1 },
        totalLikes: { $sum: "$likesCount" },
        totalComments: { $sum: "$commentsCount" },
      },
    },
    { $sort: { posts: -1 } },
    { $limit: 10 },
    {
      $project: {
        tag: "$_id",
        posts: 1,
        growth: "+100%",
        trend: "up",
        description: "Popular topic in the community",
      },
    },
  ]);
  
  console.log('\nTrending topics result:');
  console.log(JSON.stringify(trendingTopics, null, 2));
  
  mongoose.connection.close();
};

testTrending().catch(console.error);