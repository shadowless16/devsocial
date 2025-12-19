// Nigerian Tech Culture Rank System
export interface Rank {
  id: string
  title: string
  minXP: number
  maxXP: number
  emoji: string
  description: string
  naijaMeaning: string
  perks: string[]
}

export const RANKS: Rank[] = [
  {
    id: "tech_jjc",
    title: "Tech JJC",
    minXP: 0,
    maxXP: 49,
    emoji: "🍼",
    description: "Just entered tech",
    naijaMeaning: "Johnny Just Come - You just start your tech journey",
    perks: ["Basic posting privileges", "Welcome badge"],
  },
  {
    id: "code_pikin",
    title: "Code Pikin",
    minXP: 50,
    maxXP: 149,
    emoji: "👶",
    description: "Baby dev, learning the ropes",
    naijaMeaning: "Small pikin wey dey learn code",
    perks: ["XP badge display", "Basic post privileges", "Comment on any post"],
  },
  {
    id: "junior_hustler",
    title: "Junior Dev Hustler",
    minXP: 150,
    maxXP: 299,
    emoji: "🧑🏽‍💻",
    description: "Small small, you dey enter",
    naijaMeaning: "You don dey understand small small",
    perks: ["Emoji reactions", "Profile customization", "Join study groups"],
  },
  {
    id: "bug_buster",
    title: "Bug Buster of Yaba",
    minXP: 300,
    maxXP: 599,
    emoji: "🐞",
    description: "You don dey sabi debugging",
    naijaMeaning: "Omo! You fit catch bug now",
    perks: ["Report bugs", "XP boost for challenges", "Colored username"],
  },
  {
    id: "backend_baddie",
    title: "Backend Baddie",
    minXP: 600,
    maxXP: 999,
    emoji: "🔌",
    description: "You dey run things with APIs",
    naijaMeaning: "Server-side don dey your hand",
    perks: ["Host polls", "Mentor badge", "Priority support"],
  },
  {
    id: "fullstack_boss",
    title: "Full Stack Dey Your Back",
    minXP: 1000,
    maxXP: 1499,
    emoji: "🚀",
    description: "Frontend and backend no dey fear you",
    naijaMeaning: "You fit handle everything",
    perks: ["Host AMA sessions", "Featured posts", "Custom profile themes"],
  },
  {
    id: "code_warri_royalty",
    title: "Code Warri Prince/Princess",
    minXP: 1500,
    maxXP: 1999,
    emoji: "👑",
    description: "Royalty of code",
    naijaMeaning: "Wahala for who no sabi you",
    perks: ["Royal badge", "Post pinning", "Exclusive channels"],
  },
  {
    id: "github_genzai",
    title: "Genzai of GitHub",
    minXP: 2000,
    maxXP: 2999,
    emoji: "💼",
    description: "Everyone dey quote your PRs",
    naijaMeaning: "You be the real deal for Git",
    perks: ["Code review privileges", "Moderator nomination", "Tech talks"],
  },
  {
    id: "senior_tech_bro",
    title: "Senior Bro/Sis for Tech",
    minXP: 3000,
    maxXP: 4999,
    emoji: "🎓",
    description: "You dey mentor juniors now",
    naijaMeaning: "Big bro/sis wey dey guide others",
    perks: ["Mentorship program", "Dev-only threads", "Conference invites"],
  },
  {
    id: "devsocial_president",
    title: "DevSocial President",
    minXP: 5000,
    maxXP: Number.POSITIVE_INFINITY,
    emoji: "🦅",
    description: "The ultimate boss",
    naijaMeaning: "You don reach the top, no cap!",
    perks: ["Custom banner", "Homepage pin", "Platform influence", "Presidential badge"],
  },
]

export function getRankByXP(xp: number): Rank {
  return RANKS.find((rank) => xp >= rank.minXP && xp <= rank.maxXP) || RANKS[0]
}

export function getNextRank(currentXP: number): Rank | null {
  const currentRank = getRankByXP(currentXP)
  const currentIndex = RANKS.findIndex((rank) => rank.id === currentRank.id)
  return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null
}

export function getProgressToNextRank(currentXP: number): {
  current: number
  required: number
  percentage: number
} {
  const nextRank = getNextRank(currentXP)
  if (!nextRank) {
    return { current: currentXP, required: currentXP, percentage: 100 }
  }

  const currentRank = getRankByXP(currentXP)
  const current = currentXP - currentRank.minXP
  const required = nextRank.minXP - currentRank.minXP
  const percentage = Math.floor((current / required) * 100)

  return { current, required, percentage }
}
