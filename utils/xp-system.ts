// XP System Configuration and Logic
export const XP_VALUES = {
  // Account & Onboarding
account_created: 10, // Already present
  profile_completed: 15,
  profile_picture_added: 5,
  github_connected: 10,
  onboarding_completed: 15,

  // Content Creation
post_created: 8, // Base XP for creating a post
  post_with_code_snippet: 11, // +3 bonus for code snippet included
  first_post_of_day: 2, // +2 bonus for first post of the day
comment_created: 4, // Base XP for creating a comment
  solution_provided: 5, // +5 bonus for providing a solution
  anonymous_confess: 5,

  // Engagement
  post_liked: 2,
  mod_super_like: 10,

  // Challenges & Activities
  weekly_challenge_joined: 12,
  first_responder_bonus: 20,

  // Community
  bug_reported: 15,
  friend_referred: 25,

  // Streaks
  daily_login: 5,

  // Special Actions
  helpful_content_bonus: 2,
  solution_provided_bonus: 5,
} as const

export type XPAction = keyof typeof XP_VALUES

// Daily limits for certain actions
export const DAILY_LIMITS = {  // Limit the number of times XP can be gained from specific actions
  post_liked: 20,
  comment_liked: 20,
  post_created: 5,
  comment_created: 10,
  daily_login: 1,
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

// Time-based multipliers
export function getTimeMultiplier(): number {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  
  // Weekend warrior bonus (Saturday & Sunday)
  if (day === 0 || day === 6) {
    return 1.5
  }
  
  // Happy hour (6 PM - 8 PM daily)
  if (hour >= 18 && hour < 20) {
    return 2.0
  }
  
  return 1.0
}

// Enhanced XP calculation with all bonuses
export function calculateXPWithBonuses(
  action: XPAction,
  userLevel: number = 1,
  streakDays: number = 0,
  content?: string,
  options?: {
    isFirstOfDay?: boolean
    isSolution?: boolean
    hasReceivedSuperLike?: boolean
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
  }
  
  // Special bonuses
  if (options?.isFirstOfDay && action === "post_created") {
    totalBonus += XP_VALUES.first_post_of_day
  }
  
  if (options?.isSolution && action === "comment_created") {
    totalBonus += XP_VALUES.solution_provided
  }
  
  // Calculate with multipliers
  const levelMultiplier = 1 + 0.1 * (userLevel - 1)
  const streakMultiplier = 1 + Math.min(streakDays * 0.05, 0.5)
  const timeMultiplier = getTimeMultiplier()
  
  const finalXP = Math.floor(
    (baseXP + totalBonus) * levelMultiplier * streakMultiplier * timeMultiplier
  )
  
  return Math.max(finalXP, 1)
}
