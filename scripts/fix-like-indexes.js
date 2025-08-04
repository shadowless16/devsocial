  const { MongoClient } = require('mongodb');

  async function fixLikeIndexes() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial-frontend';
    const client = new MongoClient(uri);

    try {
      await client.connect();
      console.log('Connected to MongoDB');

      const db = client.db();
      const likesCollection = db.collection('likes');

      // Drop all existing indexes
      console.log('Dropping existing indexes...');
      await likesCollection.dropIndexes();

      // Create new indexes - separate for posts and comments
      console.log('Creating new indexes...');
      
      // Index for post likes (user + post must be unique)
      await likesCollection.createIndex(
        { user: 1, post: 1 }, 
        { unique: true, name: 'user_post_unique' }
      );
      
      // Index for comment likes (user + comment must be unique, but sparse for nulls)
      await likesCollection.createIndex(
        { user: 1, comment: 1 }, 
        { unique: true, sparse: true, name: 'user_comment_unique' }
      );

      console.log('✅ Indexes fixed successfully!');

      // Check existing likes
      const likeCount = await likesCollection.countDocuments();
      console.log(`📊 Total likes in database: ${likeCount}`);

      if (likeCount > 0) {
        console.log('🗑️ Clearing existing likes to prevent conflicts...');
        await likesCollection.deleteMany({});
        console.log('✅ Cleared all existing likes');
      }

    } catch (error) {
      console.error('Error fixing indexes:', error);
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  fixLikeIndexes().catch(console.error);


  // 