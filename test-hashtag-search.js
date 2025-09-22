// Test hashtag search functionality
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0');

const PostSchema = new mongoose.Schema({
  content: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

async function testHashtagSearch() {
  try {
    console.log('=== TESTING HASHTAG SEARCH ===');
    
    // Test 1: Search for "javascript" (should find 8 posts)
    console.log('\n1. Searching for "javascript":');
    const jsResults = await Post.find({ tags: 'javascript' }).select('content tags');
    console.log(`Found ${jsResults.length} posts with javascript tag`);
    
    // Test 2: Search for "#javascript" (normalized to "javascript")
    console.log('\n2. Searching for "#javascript" (normalized):');
    const normalizedTag = '#javascript'.replace(/^#/, '').toLowerCase().trim();
    const jsResults2 = await Post.find({ tags: normalizedTag }).select('content tags');
    console.log(`Found ${jsResults2.length} posts with normalized javascript tag`);
    
    // Test 3: Search for "ai" 
    console.log('\n3. Searching for "ai":');
    const aiResults = await Post.find({ tags: 'ai' }).select('content tags');
    console.log(`Found ${aiResults.length} posts with ai tag`);
    aiResults.forEach(post => {
      console.log(`- ${post.content.substring(0, 50)}... [${post.tags.join(', ')}]`);
    });
    
    // Test 4: Regex search for partial matches
    console.log('\n4. Regex search for "java":');
    const javaRegex = new RegExp('java', 'i');
    const javaResults = await Post.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: javaRegex } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Java-related tags:');
    javaResults.forEach(result => {
      console.log(`- ${result._id}: ${result.count} posts`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testHashtagSearch();