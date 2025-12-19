// Bloated XP System Configuration
export const XP_VALUES = {
  // Account & Onboarding (INCREASED)
  account_created: 50,
  profile_completed: 100,
  profile_picture_added: 25,
  github_connected: 100,
  onboarding_completed: 150,
  email_verified: 75,

  // Content Creation (BLOATED)
  post_created: 15, // Was 8, now 15
  post_with_code_snippet: 25, // Big bonus for code
  quality_post_bonus: 35, // 500+ chars with code
  viral_post_bonus: 100, // 100+ likes
  first_post_of_day: 20, // Big daily bonus
  comment_created: 8, // Was 4, now 8
  helpful_comment_bonus: 15,
  solution_provided: 25, // Was 5, now 25
  anonymous_confess: 12,

  // Engagement (INCREASED)
  post_liked: 3, // Was 2, now 3
  comment_liked: 2,
  post_received_like: 2, // Get XP when others like your post
  comment_received_like: 1,
  mod_super_like: 25, // Was 10, now 25

  // Social Actions (NEW)
  user_followed: 5,
  got_followed: 10,
  profile_viewed: 1,

  // Challenges & Activities (MASSIVE)
  weekly_challenge_joined: 50, // Was 12, now 50
  challenge_completed: 200,
  first_responder_bonus: 75, // Was 20, now 75

  // Community (INCREASED)
  bug_reported: 75, // Was 15, now 75
  friend_referred: 150, // Was 25, now 150

  // Streaks (BLOATED)
  daily_login: 10, // Was 5, now 10
  streak_3_days: 30,
  streak_7_days: 100,
  streak_30_days: 500,

  // Special Achievements
  first_100_likes: 500,
  first_1000_views: 1000,
  verified_profile: 200,
  birthday_bonus: 1000,

  // Multiplier Bonuses
  helpful_content_bonus: 5, // Was 2, now 5
  solution_provided_bonus: 15, // Was 5, now 15
} as const

export type XPAction = keyof typeof XP_VALUES

// Generous Daily Limits
export const DAILY_LIMITS = {
  post_liked: 50, // Was 20, now 50
  comment_liked: 50, // Was 20, now 50
  post_created: 10, // Was 5, now 10
  comment_created: 20, // Was 10, now 20
  daily_login: 1,
  profile_viewed: 100, // New
  user_followed: 25, // New
} as const

// XP Cap Implementation
export function isWithinDailyCap(action: XPAction, currentCount: number): boolean {
  const limit = DAILY_LIMITS[action as keyof typeof DAILY_LIMITS];
  return typeof limit === 'undefined' || currentCount < limit;
}

// XP Calculation with bonuses
export function calculateXP(baseAction: XPAction, userLevel = 1, streakDays = 0, isHelpfulContent = false): number {
  let baseXP = XP_VALUES[baseAction]

  // Level multiplier (10% per level)
  const levelMultiplier = 1 + 0.1 * (userLevel - 1)

  // Streak bonus (max 50% bonus at 10+ day streak)
  const streakBonus = Math.min(streakDays * 0.05, 0.5)

  // Helpful content bonus
  if (isHelpfulContent && (baseAction === "post_created" || baseAction === "comment_created")) {
    baseXP += XP_VALUES.helpful_content_bonus
  }

  const finalXP = Math.floor(baseXP * levelMultiplier * (1 + streakBonus))

  return Math.max(finalXP, 1) // Minimum 1 XP
}

// Check if content is helpful (simple keyword detection)
export function isHelpfulContent(content: string): boolean {
  const helpfulKeywords = [
    "help",
    "solution",
    "fix",
    "solve",
    "tutorial",
    "guide",
    "explain",
    "how to",
    "step by step",
    "debug",
    "error",
  ]

  const lowerContent = content.toLowerCase()
  return helpfulKeywords.some((keyword) => lowerContent.includes(keyword))
}

// Check if content contains code snippet
export function hasCodeSnippet(content: string): boolean {
  // Check for code blocks (```), inline code (`), or common code patterns
  const codePatterns = [
    /```[\s\S]*?```/,  // Code blocks
    /`[^`]+`/,         // Inline code
    /function\s+\w+\s*\(/,  // Function declarations
    /const\s+\w+\s*=/,      // Const declarations
    /import\s+.*from/,       // Import statements
    /class\s+\w+/,          // Class declarations
  ]
  
  return codePatterns.some(pattern => pattern.test(content))
}

// Calculate bonus XP based on content quality
export function calculateContentBonus(content: string, action: XPAction): number {
  let bonus = 0
  
  // Code snippet bonus
  if ((action === "post_created" || action === "comment_created") && hasCodeSnippet(content)) {
    bonus += 3
  }
  
  // Length bonus for substantial content (min 100 chars)
  if (content.length >= 100) {
    bonus += 1
  }
  
  // Quality content bonus (min 500 chars with code)
  if (content.length >= 500 && hasCodeSnippet(content)) {
    bonus += 2
  }
  
  return bonus
}

// Streak milestone bonuses
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 50  // 30-day streak bonus
  if (streakDays >= 14) return 20  // 14-day streak bonus
  if (streakDays >= 7) return 10   // 7-day streak bonus
  return 0
}

// Enhanced Time-based multipliers
export function getTimeMultiplier(): number {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  
  // Weekend warrior bonus (Saturday & Sunday)
  if (day === 0 || day === 6) {
    return 2.0 // Increased from 1.5 to 2.0
  }
  
  // Happy hour (6 PM - 8 PM daily)
  if (hour >= 18 && hour < 20) {
    return 3.0 // Increased from 2.0 to 3.0
  }
  
  // Morning boost (6 AM - 9 AM)
  if (hour >= 6 && hour < 9) {
    return 1.5
  }
  
  return 1.0
}

// Bloated XP calculation with generous bonuses
export function calculateXPWithBonuses(
  action: XPAction,
  userLevel: number = 1,
  streakDays: number = 0,
  content?: string,
  options?: {
    isFirstOfDay?: boolean
    isSolution?: boolean
    hasReceivedSuperLike?: boolean
    isViral?: boolean
    likesCount?: number
  }
): number {
  let baseXP = XP_VALUES[action]
  let totalBonus = 0
  
  // Content quality bonuses
  if (content) {
    if (isHelpfulContent(content)) {
      totalBonus += XP_VALUES.helpful_content_bonus
    }
    totalBonus += calculateContentBonus(content, action)
    
    // Quality post bonus for long posts with code
    if (content.length >= 500 && hasCodeSnippet(content)) {
      totalBonus += XP_VALUES.quality_post_bonus
    }
  }
  
  // Special bonuses
  if (options?.isFirstOfDay && action === "post_created") {
    totalBonus += XP_VALUES.first_post_of_day
  }
  
  if (options?.isSolution && action === "comment_created") {
    totalBonus += XP_VALUES.solution_provided
  }
  
  // Viral content bonus
  if (options?.isViral || (options?.likesCount && options.likesCount >= 100)) {
    totalBonus += XP_VALUES.viral_post_bonus
  }
  
  // Calculate with generous multipliers
  const levelMultiplier = 1 + 0.15 * (userLevel - 1) // Increased from 0.1 to 0.15
  const streakMultiplier = 1 + Math.min(streakDays * 0.08, 0.8) // Increased from 0.05 to 0.08, max from 0.5 to 0.8
  const timeMultiplier = getTimeMultiplier()
  
  const finalXP = Math.floor(
    (baseXP + totalBonus) * levelMultiplier * streakMultiplier * timeMultiplier
  )
  
  return Math.max(finalXP, 5) // Minimum 5 XP instead of 1
}
