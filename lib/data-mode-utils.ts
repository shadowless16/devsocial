// Sample data for demo mode
export const sampleUsers = [
  {
    _id: 'demo1',
    username: 'alex_dev',
    displayName: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    points: 2450,
    level: 3,
    badges: ['early-adopter', 'code-master'],
    followersCount: 156,
    followingCount: 89,
    isGenerated: false
  },
  {
    _id: 'demo2',
    username: 'sarah_codes',
    displayName: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    points: 3200,
    level: 4,
    badges: ['bug-hunter', 'mentor'],
    followersCount: 234,
    followingCount: 67,
    isGenerated: false
  },
  {
    _id: 'demo3',
    username: 'mike_fullstack',
    displayName: 'Mike Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    points: 1890,
    level: 2,
    badges: ['contributor'],
    followersCount: 98,
    followingCount: 123,
    isGenerated: false
  }
]

export const samplePosts = [
  {
    _id: 'post1',
    author: sampleUsers[0],
    content: 'Just deployed my first React app with Next.js 14! The app router is amazing 🚀',
    tags: ['react', 'nextjs', 'deployment'],
    likesCount: 45,
    commentsCount: 12,
    viewsCount: 234,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  },
  {
    _id: 'post2',
    author: sampleUsers[1],
    content: 'Working on a machine learning project to predict code complexity. Any tips on feature engineering?',
    tags: ['machinelearning', 'python', 'coding'],
    likesCount: 67,
    commentsCount: 23,
    viewsCount: 456,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  },
  {
    _id: 'post3',
    author: sampleUsers[2],
    content: 'Built a real-time chat app with Socket.io and Express. The WebSocket integration was tricky but worth it!',
    tags: ['nodejs', 'socketio', 'realtime'],
    likesCount: 89,
    commentsCount: 34,
    viewsCount: 678,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  }
]

export const sampleLeaderboard = [
  { ...sampleUsers[1], rank: 1 },
  { ...sampleUsers[0], rank: 2 },
  { ...sampleUsers[2], rank: 3 },
  {
    _id: 'demo4',
    username: 'emma_designer',
    displayName: 'Emma Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    points: 1650,
    level: 2,
    badges: ['designer'],
    followersCount: 145,
    followingCount: 78,
    rank: 4
  },
  {
    _id: 'demo5',
    username: 'david_backend',
    displayName: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    points: 1420,
    level: 2,
    badges: ['backend-pro'],
    followersCount: 87,
    followingCount: 156,
    rank: 5
  }
]

// Helper function to get data based on mode
export function getDataByMode<T>(dataMode: 'generated' | 'demo', realData: T, sampleData: T): T {
  return dataMode === 'demo' ? sampleData : realData
}

// Helper to build MongoDB filter based on data mode
export function getDataModeFilter(dataMode: 'generated' | 'demo') {
  if (dataMode === 'demo') {
    return {} // Demo mode doesn't query DB
  }
  return {} // All users are generated now, so no filter needed
}