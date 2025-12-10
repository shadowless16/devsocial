// Centralized TypeScript type definitions for DevSocial

// ============= User & Author Types =============

export interface Author {
  _id?: string
  username: string
  displayName: string
  avatar: string
  level: number
  role?: string
  gender?: 'male' | 'female' | 'other'
}

export interface User extends Author {
  email?: string
  bio?: string
  location?: string
  techStack: string[]
  points: number
  xp: number
  followersCount: number
  followingCount: number
  joinDate?: string
  bannerUrl?: string
  totalLikes?: number
  onboardingCompleted?: boolean
  createdAt?: string
}

// ============= Post Types =============

export interface PollOption {
  id: string
  text: string
  votes: number
  voters: string[]
}

export interface PollSettings {
  multipleChoice: boolean
  maxChoices: number
  showResults: 'always' | 'afterVote' | 'afterEnd'
  allowAddOptions: boolean
}

export interface Poll {
  question: string
  options: PollOption[]
  settings: PollSettings
  endsAt?: string
  totalVotes: number
}

export interface LinkPreview {
  title: string
  description: string
  image?: string
  url: string
  siteName: string
}

export interface OnChainProof {
  txId?: string
  topicId?: string
  seq?: number
}

export type ImprintStatus = 'none' | 'pending' | 'submitted' | 'confirmed' | 'failed' | 'duplicate'

export interface Post {
  _id?: string
  id: string
  author: Author | null
  content: string
  imageUrl?: string | null
  imageUrls?: string[]
  videoUrls?: string[]
  tags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  createdAt: string
  isAnonymous: boolean
  isLiked: boolean
  imprintStatus?: ImprintStatus
  onChainProof?: OnChainProof | null
  poll?: Poll
  linkPreview?: LinkPreview
}

// ============= Comment Types =============

export interface Comment {
  _id: string
  id: string
  author: Author
  content: string
  createdAt: string
  likesCount: number
  isLiked: boolean
  replies?: Comment[]
}

// ============= Profile Types =============

export interface ProfileData {
  _id?: string
  name: string
  username: string
  avatar: string
  bio?: string
  location?: string
  joinDate?: string
  techStack: string[]
  points: number
  level: number
  followersCount: number
  followingCount: number
  totalLikes?: number
  bannerUrl?: string
  title?: string
  socialLinks?: SocialLink[]
  skills?: string[]
  privacySettings?: PrivacySettings
}

export interface SocialLink {
  platform: string
  url: string
}

export interface PrivacySettings {
  profileVisibility: boolean
  showEmail: boolean
  showLocation: boolean
  showActivity: boolean
  allowMessages: boolean
  showStats: boolean
}

// ============= API Response Types =============

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PostsResponse {
  posts: Post[]
  hasMore: boolean
  total?: number
}

export interface UserSearchResult {
  _id: string
  username: string
  displayName: string
  avatar: string
  bio?: string
  level?: number
  points?: number
}

// ============= Search Types =============

export interface AISummary {
  query?: string
  summary?: string
  keywords?: string[]
}

export interface SearchResults {
  users: UserSearchResult[]
  posts: Post[]
  tags: TagResult[]
}

export interface TagResult {
  _id: string
  name: string
  slug: string
  usageCount: number
}

export interface TrendingData {
  trending: TrendingItem[]
  topics: TopicItem[]
  users: UserSearchResult[]
}

export interface TrendingItem {
  _id: string
  name: string
  count: number
}

export interface TopicItem {
  _id: string
  name: string
  tag?: string
  description?: string
  postCount: number
  count?: number
}

// Re-export all type modules
export * from './career-paths'
export * from './api'
export * from './auth'
export * from './models'
export * from './errors'
export * from './guards'
