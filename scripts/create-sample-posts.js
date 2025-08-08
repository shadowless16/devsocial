// const { MongoClient } = require('mongodb');
// const bcrypt = require('bcryptjs');

// async function createSamplePosts() {
//   const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial-frontend';
//   const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');

//     const db = client.db();
//     const usersCollection = db.collection('users');
//     const postsCollection = db.collection('posts');

//     // Find any user in the database
//     const testUser = await usersCollection.findOne({});
//     if (!testUser) {
//       console.error('No users found in database. Please create a user first.');
//       return;
//     }

//     console.log('Found test user:', testUser.username);

//     // Sample posts data
//     const samplePosts = [
//       {
//         author: testUser._id,
//         isAnonymous: false,
//         content: "Just deployed my first Next.js app to production! 🚀 \n\nLearned a lot about:\n- Server-side rendering\n- API routes\n- Database integration\n\n```javascript\nconst greeting = 'Hello World!';\nconsole.log(greeting);\n```\n\nExcited to share it with everyone!",
//         tags: ['nextjs', 'deployment', 'javascript', 'webdev'],
//         likesCount: 15,
//         commentsCount: 5,
//         xpAwarded: 25,
//         createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//         updatedAt: new Date()
//       },
//       {
//         author: testUser._id,
//         isAnonymous: false,
//         content: "Quick tip for debugging React components! 🐛\n\nUse React DevTools to inspect component state and props in real-time. It's a game changer!\n\nAlso, console.log() is still your best friend for understanding data flow.",
//         tags: ['react', 'debugging', 'tips', 'frontend'],
//         likesCount: 8,
//         commentsCount: 2,
//         xpAwarded: 20,
//         createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
//         updatedAt: new Date()
//       },
//       {
//         author: testUser._id,
//         isAnonymous: false,
//         content: "Working on a new authentication system with NextAuth.js. The integration with MongoDB is surprisingly smooth!\n\nKey things I learned:\n- Session management\n- JWT tokens\n- Custom providers\n- Middleware protection\n\nAnyone else using NextAuth? Would love to hear your experiences!",
//         tags: ['nextauth', 'authentication', 'mongodb', 'security'],
//         likesCount: 22,
//         commentsCount: 8,
//         xpAwarded: 30,
//         createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
//         updatedAt: new Date()
//       },
//       {
//         author: testUser._id,
//         isAnonymous: false,
//         content: "CSS Grid vs Flexbox - when to use which? 🤔\n\nMy rule of thumb:\n- **Flexbox**: One-dimensional layouts (rows or columns)\n- **CSS Grid**: Two-dimensional layouts (rows AND columns)\n\nBoth are powerful, but choosing the right tool makes all the difference!",
//         tags: ['css', 'grid', 'flexbox', 'layout', 'frontend'],
//         likesCount: 18,
//         commentsCount: 6,
//         xpAwarded: 25,
//         createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
//         updatedAt: new Date()
//       },
//       {
//         author: testUser._id,
//         isAnonymous: false,
//         content: "Just discovered Tailwind CSS and I'm blown away! 🎨\n\nUtility-first approach makes styling so much faster. No more switching between CSS files!\n\n```html\n<div class=\"bg-blue-500 text-white p-4 rounded-lg shadow-md\">\n  Beautiful component!\n</div>\n```\n\nGamechanger for rapid prototyping!",
//         tags: ['tailwindcss', 'css', 'styling', 'productivity'],
//         likesCount: 12,
//         commentsCount: 4,
//         xpAwarded: 20,
//         createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
//         updatedAt: new Date()
//       }
//     ];

//     // Insert sample posts
//     const result = await postsCollection.insertMany(samplePosts);
//     console.log(`✅ Created ${result.insertedCount} sample posts!`);

//     // Display created posts
//     console.log('\n📝 Sample posts created:');
//     samplePosts.forEach((post, index) => {
//       console.log(`${index + 1}. ${post.content.substring(0, 50)}...`);
//       console.log(`   Tags: ${post.tags.join(', ')}`);
//       console.log(`   Likes: ${post.likesCount}, Comments: ${post.commentsCount}`);
//       console.log(`   XP: ${post.xpAwarded}`);
//       console.log('');
//     });

//   } catch (error) {
//     console.error('Error creating sample posts:', error);
//   } finally {
//     await client.close();
//     console.log('Disconnected from MongoDB');
//   }
// }

// createSamplePosts().catch(console.error);
