export const sampleMissions = [
  {
    title: "Social Butterfly",
    description: "Build your network by connecting with fellow developers",
    type: "social",
    difficulty: "beginner",
    duration: "weekly",
    steps: [
      {
        id: "follow_5",
        title: "Follow 5 Developers",
        description: "Discover and follow 5 interesting developers",
        target: 5,
        metric: "follows",
        completed: false
      },
      {
        id: "get_5_followers",
        title: "Gain 5 Followers",
        description: "Attract 5 new followers to your profile",
        target: 5,
        metric: "followers",
        completed: false
      }
    ],
    rewards: {
      xp: 200,
      badge: "networker",
      title: "Community Connector"
    }
  },
  {
    title: "Content Creator",
    description: "Share your knowledge and engage with the community",
    type: "content",
    difficulty: "intermediate",
    duration: "weekly",
    steps: [
      {
        id: "create_3_posts",
        title: "Create 3 Posts",
        description: "Share 3 valuable posts with the community",
        target: 3,
        metric: "posts",
        completed: false
      },
      {
        id: "get_20_likes",
        title: "Receive 20 Likes",
        description: "Get 20 likes across all your posts",
        target: 20,
        metric: "likes_received",
        completed: false
      },
      {
        id: "share_code",
        title: "Share Code Snippet",
        description: "Post at least one code snippet or tutorial",
        target: 1,
        metric: "code_posts",
        completed: false
      }
    ],
    rewards: {
      xp: 350,
      badge: "content_creator",
      title: "Knowledge Sharer"
    }
  },
  {
    title: "Community Helper",
    description: "Help other developers by engaging with their content",
    type: "engagement",
    difficulty: "beginner",
    duration: "daily",
    steps: [
      {
        id: "comment_10",
        title: "Leave 10 Comments",
        description: "Provide helpful comments on other posts",
        target: 10,
        metric: "comments",
        completed: false
      },
      {
        id: "like_20_posts",
        title: "Like 20 Posts",
        description: "Show appreciation by liking quality content",
        target: 20,
        metric: "likes_given",
        completed: false
      }
    ],
    rewards: {
      xp: 150,
      badge: "helper",
      title: "Community Support"
    }
  },
  {
    title: "Learning Journey",
    description: "Expand your skills and knowledge",
    type: "learning",
    difficulty: "advanced",
    duration: "monthly",
    steps: [
      {
        id: "complete_challenges",
        title: "Complete 5 Challenges",
        description: "Finish 5 weekly coding challenges",
        target: 5,
        metric: "challenges_completed",
        completed: false
      },
      {
        id: "share_project",
        title: "Share a Project",
        description: "Showcase a personal or work project",
        target: 1,
        metric: "projects_shared",
        completed: false
      },
      {
        id: "mentor_someone",
        title: "Help a Beginner",
        description: "Provide guidance to someone new",
        target: 1,
        metric: "mentoring_sessions",
        completed: false
      }
    ],
    rewards: {
      xp: 500,
      badge: "mentor",
      title: "Knowledge Master",
      specialReward: "Featured Developer Badge"
    }
  },
  {
    title: "Elite Developer",
    description: "Achieve mastery and become a platform leader",
    type: "achievement",
    difficulty: "expert",
    duration: "permanent",
    steps: [
      {
        id: "reach_level_10",
        title: "Reach Level 10",
        description: "Accumulate enough XP to reach level 10",
        target: 10,
        metric: "level",
        completed: false
      },
      {
        id: "get_100_followers",
        title: "Gain 100 Followers",
        description: "Build a following of 100+ developers",
        target: 100,
        metric: "followers",
        completed: false
      },
      {
        id: "create_50_posts",
        title: "Create 50 Posts",
        description: "Share 50 valuable posts with the community",
        target: 50,
        metric: "posts",
        completed: false
      }
    ],
    rewards: {
      xp: 1000,
      badge: "elite_developer",
      title: "Platform Elite",
      specialReward: "Custom Profile Theme"
    },
    prerequisites: ["networker", "content_creator", "mentor"]
  }
]