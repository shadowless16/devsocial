// API Request and Response Types

import { User, Post, Comment } from './index'

// ============= Base API Types =============

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, string[]>
}

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  nextCursor?: string
}

// ============= Authentication API Types =============

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface SignupRequest {
  username: string
  email: string
  password: string
  displayName: string
}

export interface SignupResponse {
  user: User
  token: string
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface VerifyEmailRequest {
  token: string
}

// ============= User API Types =============

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  location?: string
  techStack?: string[]
  avatar?: string
  bannerUrl?: string
  socialLinks?: Array<{ platform: string; url: string }>
}

export interface UserProfileResponse {
  user: User
  isFollowing: boolean
  isOwnProfile: boolean
}

export interface FollowResponse {
  isFollowing: boolean
  followersCount: number
}

// ============= Post API Types =============

export interface CreatePostRequest {
  content: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrls?: string[]
  tags?: string[]
  isAnonymous?: boolean
  poll?: {
    question: string
    options: string[]
    settings?: {
      multipleChoice?: boolean
      maxChoices?: number
      showResults?: 'always' | 'afterVote' | 'afterEnd'
      allowAddOptions?: boolean
    }
    endsAt?: string
  }
}

export interface UpdatePostRequest {
  content?: string
  tags?: string[]
}

export interface PostsQueryParams extends PaginationParams {
  tag?: string
  username?: string
  following?: boolean
  trending?: boolean
  sortBy?: 'recent' | 'popular' | 'trending'
}

export interface PostResponse {
  post: Post
}

export interface PostsResponse {
  posts: Post[]
  hasMore: boolean
  total?: number
}

// ============= Comment API Types =============

export interface CreateCommentRequest {
  content: string
  parentCommentId?: string
  imageUrl?: string
}

export interface CommentsResponse {
  comments: Comment[]
  total: number
}

// ============= Like API Types =============

export interface LikeResponse {
  isLiked: boolean
  likesCount: number
}

// ============= Search API Types =============

export interface SearchParams {
  query: string
  type?: 'all' | 'users' | 'posts' | 'tags'
  page?: number
  limit?: number
}

export interface SearchResponse {
  users: User[]
  posts: Post[]
  tags: Array<{ name: string; count: number }>
  total: number
}

// ============= Dashboard API Types =============

export interface DashboardStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalFollowers: number
  totalFollowing: number
  xp: number
  level: number
  rank: number
}

export interface ActivityData {
  date: string
  posts: number
  likes: number
  comments: number
  xp: number
}

export interface DashboardResponse {
  stats: DashboardStats
  recentActivity: ActivityData[]
  topPosts: Post[]
  xpBreakdown: Record<string, number>
}

// ============= Leaderboard API Types =============

export interface LeaderboardEntry {
  rank: number
  user: User
  xp: number
  level: number
  change?: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  currentUser?: LeaderboardEntry
  period: 'all' | 'weekly' | 'monthly'
}

// ============= Challenge API Types =============

export interface Challenge {
  _id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  startDate: string
  endDate: string
  participants: number
  isActive: boolean
}

export interface ChallengeSubmission {
  challengeId: string
  solution: string
  language: string
}

export interface ChallengeResponse {
  challenge: Challenge
  hasJoined: boolean
  hasSubmitted: boolean
}

// ============= Notification API Types =============

export interface Notification {
  _id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'badge' | 'xp'
  message: string
  read: boolean
  createdAt: string
  link?: string
  actor?: {
    username: string
    avatar: string
  }
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  hasMore: boolean
}

// ============= Upload API Types =============

export interface UploadResponse {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

// ============= AI API Types =============

export interface TranscribeRequest {
  audio: File
}

export interface TranscribeResponse {
  transcription: string
  remainingUsage: number
  monthlyLimit: number
}

export interface AnalyzeImageRequest {
  image: File
  prompt?: string
}

export interface AnalyzeImageResponse {
  analysis: string
  tags: string[]
  remainingUsage: number
}

export interface EnhanceTextRequest {
  text: string
  style?: 'professional' | 'casual' | 'technical'
}

export interface EnhanceTextResponse {
  enhancedText: string
  suggestions: string[]
}

// ============= Analytics API Types =============

export interface AnalyticsOverview {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalEngagement: number
  growthRate: number
}

export interface AnalyticsResponse {
  overview: AnalyticsOverview
  userGrowth: Array<{ date: string; count: number }>
  postActivity: Array<{ date: string; count: number }>
  topUsers: User[]
  topPosts: Post[]
}
