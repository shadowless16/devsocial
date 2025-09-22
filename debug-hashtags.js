// Debug script to check hashtag data
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0');

const PostSchema = new mongoose.Schema({
  content: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const TagSchema = new mongoose.Schema({
  name: String,
  slug: String,
  usageCount: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', PostSchema);
const Tag = mongoose.model('Tag', TagSchema);

async function debugHashtags() {
  try {
    console.log('=== POSTS WITH TAGS ===');
    const postsWithTags = await Post.find({ tags: { $exists: true, $ne: [] } })
      .select('content tags createdAt')
      .limit(10);
    
    postsWithTags.forEach(post => {
      console.log(`Post: ${post.content.substring(0, 50)}...`);
      console.log(`Tags: ${JSON.stringify(post.tags)}`);
      console.log('---');
    });

    console.log('\n=== ALL TAGS IN DATABASE ===');
    const allTags = await Tag.find({}).select('name slug usageCount');
    allTags.forEach(tag => {
      console.log(`Tag: ${tag.name} (slug: ${tag.slug}, usage: ${tag.usageCount})`);
    });

    console.log('\n=== POSTS WITH MOTIVATIONMONDAY ===');
    const motivationPosts = await Post.find({ 
      tags: { $in: ['motivationmonday'] } 
    }).select('content tags');
    console.log(`Found ${motivationPosts.length} posts with motivationmonday tag`);
    
    motivationPosts.forEach(post => {
      console.log(`Content: ${post.content.substring(0, 100)}...`);
      console.log(`Tags: ${JSON.stringify(post.tags)}`);
      console.log('---');
    });

    console.log('\n=== POSTS WITH ANY MOTIVATION TAG ===');
    const anyMotivationPosts = await Post.find({ 
      tags: { $regex: /motivation/i } 
    }).select('content tags');
    console.log(`Found ${anyMotivationPosts.length} posts with any motivation tag`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugHashtags();