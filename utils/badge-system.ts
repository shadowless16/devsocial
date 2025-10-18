// Badge System
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  condition: string
  naijaMeaning: string
}

export const BADGES: Badge[] = [
  // Welcome Badges
  {
    id: "welcome",
    name: "Welcome to DevSocial",
    description: "Joined the community",
    icon: "👋",
    rarity: "common",
    condition: "account_created",
    naijaMeaning: "You don join the family!",
  },
  {
    id: "onboarding_complete",
    name: "Setup Complete",
    description: "Finished profile setup",
    icon: "✅",
    rarity: "common",
    condition: "onboarding_completed",
    naijaMeaning: "You don show face properly!",
  },

  // Content Badges
  {
    id: "first_post",
    name: "First Yarn",
    description: "Made your first post",
    icon: "📝",
    rarity: "common",
    condition: "first_post",
    naijaMeaning: "You don break your mouth!",
  },
  {
    id: "prolific_poster",
    name: "Gist Master",
    description: "Made 50 posts",
    icon: "📚",
    rarity: "uncommon",
    condition: "posts_count_50",
    naijaMeaning: "You get plenty gist to share!",
  },

  // Engagement Badges
  {
    id: "popular_post",
    name: "Viral Vibes",
    description: "Post got 100+ likes",
    icon: "🔥",
    rarity: "rare",
    condition: "post_likes_100",
    naijaMeaning: "Your post don blow!",
  },
  {
    id: "helpful_soul",
    name: "Helper of the People",
    description: "Provided 25 helpful solutions",
    icon: "🤝",
    rarity: "uncommon",
    condition: "helpful_solutions_25",
    naijaMeaning: "You dey help people well well!",
  },

  // Streak Badges
  {
    id: "consistent_coder",
    name: "Consistent Coder",
    description: "7-day login streak",
    icon: "📅",
    rarity: "uncommon",
    condition: "login_streak_7",
    naijaMeaning: "You no dey miss for ground!",
  },
  {
    id: "dedication_king",
    name: "Dedication King/Queen",
    description: "30-day login streak",
    icon: "👑",
    rarity: "rare",
    condition: "login_streak_30",
    naijaMeaning: "Your dedication dey inspire!",
  },

  // Profile Badges
  {
    id: "first_impression",
    name: "First Impression",
    description: "Uploaded a profile picture",
    icon: "📸",
    rarity: "common",
    condition: "profile_picture_uploaded",
    naijaMeaning: "You don show your face!",
  },

  // Special Badges
  {
    id: "bug_hunter",
    name: "Bug Hunter",
    description: "Reported 5 valid bugs",
    icon: "🕵️",
    rarity: "rare",
    condition: "bugs_reported_5",
    naijaMeaning: "You dey secure the house!",
  },
  {
    id: "mentor",
    name: "Big Bro/Sis",
    description: "Mentored 10 junior developers",
    icon: "🎓",
    rarity: "legendary",
    condition: "mentored_users_10",
    naijaMeaning: "You dey raise the next generation!",
  },
  {
    id: "community_champion",
    name: "Community Champion",
    description: "Top contributor this month",
    icon: "🏆",
    rarity: "legendary",
    condition: "monthly_top_contributor",
    naijaMeaning: "You be the real MVP!",
  },
]

export function checkBadgeEligibility(userId: string, userStats: any): Badge[] {
  const earnedBadges: Badge[] = []

  // Check each badge condition
  BADGES.forEach((badge) => {
    switch (badge.condition) {
      case "account_created":
        if (userStats.accountCreated) earnedBadges.push(badge)
        break
      case "onboarding_completed":
        if (userStats.onboardingCompleted) earnedBadges.push(badge)
        break
      case "first_post":
        if (userStats.postsCount >= 1) earnedBadges.push(badge)
        break
      case "posts_count_50":
        if (userStats.postsCount >= 50) earnedBadges.push(badge)
        break
      case "post_likes_100":
        if (userStats.maxPostLikes >= 100) earnedBadges.push(badge)
        break
      case "helpful_solutions_25":
        if (userStats.helpfulSolutions >= 25) earnedBadges.push(badge)
        break
      case "login_streak_7":
        if (userStats.loginStreak >= 7) earnedBadges.push(badge)
        break
      case "login_streak_30":
        if (userStats.loginStreak >= 30) earnedBadges.push(badge)
        break
      case "bugs_reported_5":
        if (userStats.bugsReported >= 5) earnedBadges.push(badge)
        break
      case "profile_picture_uploaded":
        if (userStats.hasCustomAvatar) earnedBadges.push(badge)
        break
      // Add more conditions as needed
    }
  })

  return earnedBadges
}
