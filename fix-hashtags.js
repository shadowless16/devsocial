// Fix hashtag inconsistencies
const mongoose = require('mongoose');

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

async function fixHashtags() {
  try {
    console.log('=== FIXING HASHTAGS ===');
    
    // Get all posts with tags
    const posts = await Post.find({ tags: { $exists: true, $ne: [] } });
    console.log(`Found ${posts.length} posts with tags`);
    
    // Normalize tags and collect unique ones
    const tagCounts = new Map();
    
    for (const post of posts) {
      const normalizedTags = post.tags.map(tag => {
        // Remove # prefix and clean up
        let cleanTag = tag.replace(/^#/, '').toLowerCase().trim();
        // Remove trailing backslashes
        cleanTag = cleanTag.replace(/\\+$/, '');
        return cleanTag;
      }).filter(tag => tag.length > 0);
      
      // Update post with normalized tags
      await Post.findByIdAndUpdate(post._id, { tags: normalizedTags });
      
      // Count tag usage
      normalizedTags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
    
    console.log(`Normalized tags in ${posts.length} posts`);
    
    // Clear existing tags and create new ones
    await Tag.deleteMany({});
    
    const tagDocs = Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      slug: name,
      usageCount: count
    }));
    
    await Tag.insertMany(tagDocs);
    console.log(`Created ${tagDocs.length} tag documents`);
    
    // Show results
    console.log('\n=== TOP TAGS ===');
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    topTags.forEach(([tag, count]) => {
      console.log(`${tag}: ${count} uses`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixHashtags();