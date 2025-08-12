#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define schemas directly (since we can't import ES modules in CommonJS)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avatar: String,
  role: { type: String, default: 'user' },
  registrationSource: { type: String, default: 'direct' },
  affiliation: String,
  birthMonth: Number,
  birthDay: Number,
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

const MONGODB_URI = process.env.MONGODB_URI;

async function generateTestGrowthData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate test users with different registration dates
    const testUsers = [];
    const now = new Date();
    
    // Create users over the last 90 days
    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const registrationDate = new Date(now);
      registrationDate.setDate(registrationDate.getDate() - daysAgo);
      
      const user = {
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        firstName: `Test${i}`,
        lastName: 'User',
        points: Math.floor(Math.random() * 2000),
        level: Math.floor(Math.random() * 5) + 1,
        createdAt: registrationDate,
        lastActive: new Date(registrationDate.getTime() + Math.random() * (now.getTime() - registrationDate.getTime())),
        registrationSource: ['direct', 'referral', 'social', 'organic', 'email', 'ads'][Math.floor(Math.random() * 6)],
        affiliation: 'Test University',
        birthMonth: Math.floor(Math.random() * 12) + 1,
        birthDay: Math.floor(Math.random() * 28) + 1
      };
      
      testUsers.push(user);
    }

    // Insert test users
    const insertedUsers = await User.insertMany(testUsers);
    console.log(`Created ${insertedUsers.length} test users`);

    // Generate test posts
    const testPosts = [];
    for (let i = 0; i < 500; i++) {
      const randomUser = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const postDate = new Date(now);
      postDate.setDate(postDate.getDate() - daysAgo);
      
      const post = {
        content: `Test post content ${i} - This is a sample post for testing analytics`,
        author: randomUser._id,
        tags: [`tag${Math.floor(Math.random() * 10)}`, `category${Math.floor(Math.random() * 5)}`],
        likesCount: Math.floor(Math.random() * 20),
        commentsCount: Math.floor(Math.random() * 10),
        viewsCount: Math.floor(Math.random() * 100),
        createdAt: postDate
      };
      
      testPosts.push(post);
    }

    const insertedPosts = await Post.insertMany(testPosts);
    console.log(`Created ${insertedPosts.length} test posts`);

    console.log('\n✅ Test data generation complete!');
    console.log('📊 You can now test the growth analytics with real data');
    
  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

generateTestGrowthData();