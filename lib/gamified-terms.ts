/**
 * Gamified Terminology Constants
 * 
 * This file contains all the gamified terms used throughout the platform
 * to replace traditional social media terminology with more engaging,
 * developer-focused language.
 */

export const GAMIFIED_TERMS = {
  // Social Actions
  FOLLOW: "Connect",
  UNFOLLOW: "Disconnect", 
  FOLLOWING: "Connecting",
  UNFOLLOWING: "Disconnecting",
  
  // Social Relationships
  FOLLOWERS: "Connections",
  FOLLOWER: "Connection", 
  FOLLOWING_LIST: "Connected",
  
  // Engagement Actions
  LIKE: "Boost",
  UNLIKE: "Remove Boost",
  LIKED: "Boosted",
  COMMENT: "Contribute",
  SHARE: "Broadcast",
  
  // Content Terms
  POST: "Share", // or keep as "Post"
  POSTS: "Shares", // or keep as "Posts"
  VIEW: "Reach",
  VIEWS: "Reach",
  
  // Notifications & Messages
  FOLLOW_NOTIFICATION: "connected with you",
  UNFOLLOW_NOTIFICATION: "disconnected from you",
  LIKE_NOTIFICATION: "boosted your post",
  COMMENT_NOTIFICATION: "contributed to your post",
  
  // Navigation & UI Labels
  CHALLENGES: "Challenges",
  MISSIONS: "Missions", 
  DEV_PROFILE: "Dev Profile",
  CONNECT_MESSAGES: "Connect",
  NETWORK_BUILDER: "Network Builder",
  
  // Badge Names (Gamified)
  SOCIAL_BUTTERFLY: "Network Builder", // Instead of Social Butterfly
  FIRST_POST: "Code Contributor",
  ENGAGEMENT_MASTER: "Community Champion",
  
  // Action Descriptions
  NEW_CONNECTION: "You have a new connection!",
  POST_BOOSTED: "Your post got a new boost!",
  POST_CONTRIBUTED: "Someone contributed to your post!",
  
  // UI Labels
  FOLLOW_BUTTON: "Connect",
  UNFOLLOW_BUTTON: "Disconnect",
  LIKE_BUTTON: "Boost",
  COMMENT_BUTTON: "Add Input",
  SHARE_BUTTON: "Broadcast",
  
  // Tooltips
  FOLLOW_TOOLTIP: "Connect with this developer",
  UNFOLLOW_TOOLTIP: "Disconnect from this developer", 
  LIKE_TOOLTIP: "Boost this post",
  UNLIKE_TOOLTIP: "Remove boost",
  COMMENT_TOOLTIP: "Add your input",
  SHARE_TOOLTIP: "Broadcast this post",
  
  // Success Messages
  FOLLOW_SUCCESS: "Connected successfully!",
  UNFOLLOW_SUCCESS: "Disconnected successfully!",
  LIKE_SUCCESS: "Post boosted!",
  COMMENT_SUCCESS: "Input added!",
  
  // Placeholders
  SEARCH_CONNECTIONS: "Search connections...",
  SEARCH_CONNECTED: "Search connected...",
  
  // General Terms
  DEVELOPER: "Developer",
  CODER: "Coder",
  TECH_ENTHUSIAST: "Tech Enthusiast",
  CODE_WARRIOR: "Code Warrior",
} as const;

// Bloated Developer Level System (50 Levels)
export const DEV_LEVELS = [
  // Beginner Tier (1-10)
  { level: 1, title: "Code Newbie", description: "Just started the coding journey", xpRequired: 0, xpToNext: 100, icon: "👶", color: "#22c55e" },
  { level: 2, title: "Script Kiddie", description: "Learning the basics", xpRequired: 100, xpToNext: 200, icon: "🔰", color: "#3b82f6" },
  { level: 3, title: "Bug Hunter", description: "Finding and fixing issues", xpRequired: 300, xpToNext: 300, icon: "🐛", color: "#f59e0b" },
  { level: 4, title: "Junior Dev", description: "Professional developer", xpRequired: 600, xpToNext: 400, icon: "💻", color: "#8b5cf6" },
  { level: 5, title: "Code Warrior", description: "Fighting bugs with code", xpRequired: 1000, xpToNext: 500, icon: "⚔️", color: "#ef4444" },
  { level: 6, title: "Syntax Slayer", description: "Master of clean code", xpRequired: 1500, xpToNext: 600, icon: "🗡️", color: "#06b6d4" },
  { level: 7, title: "Loop Master", description: "Iterating through challenges", xpRequired: 2100, xpToNext: 700, icon: "🔄", color: "#84cc16" },
  { level: 8, title: "Function Wizard", description: "Magical code creator", xpRequired: 2800, xpToNext: 800, icon: "🧙♂️", color: "#a855f7" },
  { level: 9, title: "Debug Ninja", description: "Silent bug eliminator", xpRequired: 3600, xpToNext: 900, icon: "🥷", color: "#1f2937" },
  { level: 10, title: "Senior Sage", description: "Wise and experienced", xpRequired: 4500, xpToNext: 1000, icon: "🧙", color: "#059669" },

  // Professional Tier (11-25)
  { level: 11, title: "Tech Lead", description: "Leading technical decisions", xpRequired: 5500, xpToNext: 1200, icon: "👑", color: "#dc2626" },
  { level: 12, title: "Code Architect", description: "Designing system architecture", xpRequired: 6700, xpToNext: 1400, icon: "🏗️", color: "#7c2d12" },
  { level: 13, title: "Stack Overlord", description: "Master of all technologies", xpRequired: 8100, xpToNext: 1600, icon: "👹", color: "#7c3aed" },
  { level: 14, title: "API Conqueror", description: "Rules all interfaces", xpRequired: 9700, xpToNext: 1800, icon: "🔌", color: "#f97316" },
  { level: 15, title: "Database Dragon", description: "Guardian of all data", xpRequired: 11500, xpToNext: 2000, icon: "🐉", color: "#dc2626" },
  { level: 16, title: "Cloud Commander", description: "Master of cloud infrastructure", xpRequired: 13500, xpToNext: 2200, icon: "☁️", color: "#0ea5e9" },
  { level: 17, title: "DevOps Deity", description: "Automation god", xpRequired: 15700, xpToNext: 2400, icon: "⚡", color: "#fbbf24" },
  { level: 18, title: "Security Sentinel", description: "Guardian of cyber security", xpRequired: 18100, xpToNext: 2600, icon: "🛡️", color: "#1f2937" },
  { level: 19, title: "Performance Phantom", description: "Speed optimization master", xpRequired: 20700, xpToNext: 2800, icon: "👻", color: "#6b7280" },
  { level: 20, title: "Full Stack Emperor", description: "Rules frontend and backend", xpRequired: 23500, xpToNext: 3000, icon: "👑", color: "#fbbf24" },

  // Expert Tier (21-35)
  { level: 21, title: "Code Samurai", description: "Disciplined coding warrior", xpRequired: 26500, xpToNext: 3500, icon: "🗾", color: "#dc2626" },
  { level: 22, title: "Algorithm Alchemist", description: "Transforms logic into gold", xpRequired: 30000, xpToNext: 4000, icon: "⚗️", color: "#fbbf24" },
  { level: 23, title: "Data Scientist Supreme", description: "Master of data mysteries", xpRequired: 34000, xpToNext: 4500, icon: "🔬", color: "#3b82f6" },
  { level: 24, title: "AI Architect", description: "Builder of intelligent systems", xpRequired: 38500, xpToNext: 5000, icon: "🤖", color: "#8b5cf6" },
  { level: 25, title: "Blockchain Baron", description: "Ruler of decentralized systems", xpRequired: 43500, xpToNext: 5500, icon: "⛓️", color: "#f59e0b" },
  { level: 26, title: "Quantum Quasar", description: "Computing at light speed", xpRequired: 49000, xpToNext: 6000, icon: "🌟", color: "#06b6d4" },
  { level: 27, title: "Cyber Shaman", description: "Digital world mystic", xpRequired: 55000, xpToNext: 6500, icon: "🔮", color: "#a855f7" },
  { level: 28, title: "Code Constellation", description: "Guiding light for developers", xpRequired: 61500, xpToNext: 7000, icon: "✨", color: "#fbbf24" },
  { level: 29, title: "Digital Demigod", description: "Half human, half code", xpRequired: 68500, xpToNext: 7500, icon: "⚡", color: "#dc2626" },
  { level: 30, title: "Tech Titan", description: "Colossal force in technology", xpRequired: 76000, xpToNext: 8000, icon: "🏔️", color: "#1f2937" },

  // Legendary Tier (31-50)
  { level: 31, title: "Code Phoenix", description: "Rises from legacy systems", xpRequired: 84000, xpToNext: 9000, icon: "🔥", color: "#dc2626" },
  { level: 32, title: "Binary Buddha", description: "Enlightened in 1s and 0s", xpRequired: 93000, xpToNext: 10000, icon: "🧘", color: "#fbbf24" },
  { level: 33, title: "Syntax Sorcerer", description: "Magical code manipulation", xpRequired: 103000, xpToNext: 11000, icon: "🪄", color: "#8b5cf6" },
  { level: 34, title: "Digital Dragon", description: "Ancient wisdom, modern code", xpRequired: 114000, xpToNext: 12000, icon: "🐲", color: "#059669" },
  { level: 35, title: "Code Cosmos", description: "Universe of programming knowledge", xpRequired: 126000, xpToNext: 13000, icon: "🌌", color: "#3b82f6" },
  { level: 36, title: "Infinite Iterator", description: "Endless loop of excellence", xpRequired: 139000, xpToNext: 14000, icon: "♾️", color: "#06b6d4" },
  { level: 37, title: "Quantum Coder", description: "Exists in multiple states", xpRequired: 153000, xpToNext: 15000, icon: "⚛️", color: "#a855f7" },
  { level: 38, title: "Holographic Hacker", description: "Projects code into reality", xpRequired: 168000, xpToNext: 16000, icon: "🎭", color: "#06b6d4" },
  { level: 39, title: "Transcendent Techie", description: "Beyond mortal programming", xpRequired: 184000, xpToNext: 17000, icon: "🌠", color: "#fbbf24" },
  { level: 40, title: "Omniscient Oracle", description: "Knows all programming truths", xpRequired: 201000, xpToNext: 18000, icon: "👁️", color: "#7c3aed" },
  { level: 41, title: "Ethereal Engineer", description: "Builds in the digital ether", xpRequired: 219000, xpToNext: 19000, icon: "👻", color: "#6b7280" },
  { level: 42, title: "Universal Unifier", description: "Connects all systems", xpRequired: 238000, xpToNext: 20000, icon: "🌐", color: "#059669" },
  { level: 43, title: "Celestial Coder", description: "Programs among the stars", xpRequired: 258000, xpToNext: 22000, icon: "⭐", color: "#fbbf24" },
  { level: 44, title: "Dimensional Developer", description: "Codes across realities", xpRequired: 280000, xpToNext: 24000, icon: "🌀", color: "#8b5cf6" },
  { level: 45, title: "Primordial Programmer", description: "First of all coders", xpRequired: 304000, xpToNext: 26000, icon: "🌋", color: "#dc2626" },
  { level: 46, title: "Cosmic Constructor", description: "Builds universes with code", xpRequired: 330000, xpToNext: 28000, icon: "🏗️", color: "#3b82f6" },
  { level: 47, title: "Infinite Intelligence", description: "Boundless coding wisdom", xpRequired: 358000, xpToNext: 30000, icon: "🧠", color: "#a855f7" },
  { level: 48, title: "Reality Renderer", description: "Makes the impossible possible", xpRequired: 388000, xpToNext: 32000, icon: "🎨", color: "#f59e0b" },
  { level: 49, title: "Source Code Sovereign", description: "Rules the origin of all code", xpRequired: 420000, xpToNext: 35000, icon: "👑", color: "#fbbf24" },
  { level: 50, title: "The Architect", description: "Creator of the digital matrix", xpRequired: 455000, xpToNext: 0, icon: "🏛️", color: "#000000" },
] as const;

// Helper functions for dynamic text
export const getConnectionText = (count: number) => 
  count === 1 ? GAMIFIED_TERMS.FOLLOWER : GAMIFIED_TERMS.FOLLOWERS;

export const getReachText = (count: number) => 
  `${count} ${GAMIFIED_TERMS.VIEWS}`;

export const getFollowActionText = (isFollowing: boolean) => 
  isFollowing ? GAMIFIED_TERMS.UNFOLLOW : GAMIFIED_TERMS.FOLLOW;

export const getFollowingActionText = (isFollowing: boolean) => 
  isFollowing ? GAMIFIED_TERMS.UNFOLLOWING : GAMIFIED_TERMS.FOLLOWING;

export const getFollowTooltip = (isFollowing: boolean) => 
  isFollowing ? GAMIFIED_TERMS.UNFOLLOW_TOOLTIP : GAMIFIED_TERMS.FOLLOW_TOOLTIP;

export const getLikeTooltip = (isLiked: boolean) => 
  isLiked ? GAMIFIED_TERMS.UNLIKE_TOOLTIP : GAMIFIED_TERMS.LIKE_TOOLTIP;

// Level System Helper Functions
export function getLevelInfo(xp: number) {
  for (let i = DEV_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= DEV_LEVELS[i].xpRequired) {
      const currentLevel = DEV_LEVELS[i];
      const nextLevel = DEV_LEVELS[i + 1];
      
      return {
        ...currentLevel,
        xpToNext: nextLevel ? nextLevel.xpRequired - xp : 0
      };
    }
  }
  return DEV_LEVELS[0];
}

export function getProgressToNextLevel(xp: number): number {
  const currentLevel = getLevelInfo(xp);
  const nextLevel = DEV_LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) return 100;
  
  const currentLevelXP = currentLevel.xpRequired;
  const nextLevelXP = nextLevel.xpRequired;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
}

export function getLevelByNumber(level: number) {
  return DEV_LEVELS.find(l => l.level === level);
}