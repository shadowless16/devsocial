const { AnalyticsService } = require('../lib/analytics-service')
const User = require('../models/User').default
const Post = require('../models/Post').default
const Comment = require('../models/Comment').default
const connectDB = require('../lib/db').default

async function generateTestData() {
  await connectDB()
  
  console.log('🧪 Generating test analytics data...')
  
  // Create test users with different signup dates and retention patterns
  const testUsers = []
  const sources = ['organic', 'referral', 'social', 'direct', 'email']
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const signupDate = new Date()
    signupDate.setDate(signupDate.getDate() - daysAgo)
    
    const user = await User.create({
      username: `testuser${i}`,
      email: `test${i}@example.com`,
      password: 'hashedpassword',
      registrationSource: sources[Math.floor(Math.random() * sources.length)],
      createdAt: signupDate,
      lastActive: Math.random() > 0.3 ? new Date() : signupDate, // 70% retention
      sessionStart: signupDate,
      country: ['US', 'UK', 'CA', 'DE', 'FR'][Math.floor(Math.random() * 5)]
    })
    
    testUsers.push(user)
  }
  
  // Create test posts
  for (let i = 0; i < 20; i++) {
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)]
    const daysAgo = Math.floor(Math.random() * 7)
    const postDate = new Date()
    postDate.setDate(postDate.getDate() - daysAgo)
    
    await Post.create({
      content: `Test post ${i}`,
      author: randomUser._id,
      tags: ['javascript', 'react', 'nodejs'][Math.floor(Math.random() * 3)],
      createdAt: postDate
    })
  }
  
  console.log('✅ Test data generated!')
  
  // Generate analytics snapshots for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    console.log(`📊 Generating analytics for ${date.toDateString()}`)
    await AnalyticsService.generateDailySnapshot(date)
  }
  
  console.log('✅ Analytics snapshots generated!')
  
  // Test retention calculation
  console.log('\n📈 Testing retention calculations:')
  const day1 = await AnalyticsService.calculateRetention(1)
  const day7 = await AnalyticsService.calculateRetention(7)
  const day30 = await AnalyticsService.calculateRetention(30)
  
  console.log(`Day 1 Retention: ${day1}%`)
  console.log(`Day 7 Retention: ${day7}%`)
  console.log(`Day 30 Retention: ${day30}%`)
  
  // Test analytics overview
  console.log('\n📊 Testing analytics overview:')
  const overview = await AnalyticsService.getAnalyticsOverview(7)
  console.log(`User Analytics Records: ${overview.userAnalytics.length}`)
  console.log(`Content Analytics Records: ${overview.contentAnalytics.length}`)
  
  process.exit(0)
}

async function cleanupTestData() {
  await connectDB()
  
  console.log('🧹 Cleaning up test data...')
  
  // Remove test users
  await User.deleteMany({ username: /^testuser/ })
  
  // Remove test posts
  await Post.deleteMany({ content: /^Test post/ })
  
  console.log('✅ Test data cleaned up!')
  process.exit(0)
}

// Run based on command line argument
const command = process.argv[2]

if (command === 'generate') {
  generateTestData().catch(console.error)
} else if (command === 'cleanup') {
  cleanupTestData().catch(console.error)
} else {
  console.log('Usage: node test-analytics.js [generate|cleanup]')
  process.exit(1)
}