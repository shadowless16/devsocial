// Database Model Types (Mongoose Document Types)

import { Document, Types } from 'mongoose'
import { UserRole, Gender } from './auth'

// ============= User Model Types =============

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  displayName: string
  avatar: string
  bannerUrl?: string
  bio?: string
  location?: string
  gender?: Gender
  role: UserRole
  techStack: string[]
  xp: number
  level: number
  points: number
  followersCount: number
  followingCount: number
  totalLikes: number
  onboardingCompleted: boolean
  isPremium: boolean
  isEmailVerified: boolean
  lastActive: Date
  joinDate: Date
  transcriptionUsage?: Record<string, number>
  imageAnalysisUsage?: Record<string, number>
  socialLinks?: Array<{ platform: string; url: string }>
  privacySettings?: {
    profileVisibility: boolean
    showEmail: boolean
    showLocation: boolean
    showActivity: boolean
    allowMessages: boolean
    showStats: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>
  generateAuthToken(): string
  addXP(amount: number, source: string): Promise<void>
  checkLevelUp(): Promise<boolean>
}

export type UserDocument = IUser & IUserMethods

// ============= Post Model Types =============

export interface IPost extends Document {
  _id: Types.ObjectId
  author: Types.ObjectId
  content: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrls?: string[]
  tags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  isAnonymous: boolean
  imprintStatus?: 'none' | 'pending' | 'submitted' | 'confirmed' | 'failed' | 'duplicate'
  onChainProof?: {
    txId?: string
    topicId?: string
    seq?: number
  }
  poll?: {
    question: string
    options: Array<{
      id: string
      text: string
      votes: number
      voters: Types.ObjectId[]
    }>
    settings: {
      multipleChoice: boolean
      maxChoices: number
      showResults: 'always' | 'afterVote' | 'afterEnd'
      allowAddOptions: boolean
    }
    endsAt?: Date
    totalVotes: number
  }
  linkPreview?: {
    title: string
    description: string
    image?: string
    url: string
    siteName: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface IPostMethods {
  incrementViews(): Promise<void>
  addComment(): Promise<void>
  removeComment(): Promise<void>
}

export type PostDocument = IPost & IPostMethods

// ============= Comment Model Types =============

export interface IComment extends Document {
  _id: Types.ObjectId
  post: Types.ObjectId
  author: Types.ObjectId
  content: string
  imageUrl?: string
  parentComment?: Types.ObjectId
  likesCount: number
  repliesCount: number
  createdAt: Date
  updatedAt: Date
}

export type CommentDocument = IComment

// ============= Like Model Types =============

export interface ILike extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetType: 'post' | 'comment'
  targetId: Types.ObjectId
  createdAt: Date
}

export type LikeDocument = ILike

// ============= Follow Model Types =============

export interface IFollow extends Document {
  _id: Types.ObjectId
  follower: Types.ObjectId
  following: Types.ObjectId
  createdAt: Date
}

export type FollowDocument = IFollow

// ============= Notification Model Types =============

export interface INotification extends Document {
  _id: Types.ObjectId
  recipient: Types.ObjectId
  actor?: Types.ObjectId
  type: 'like' | 'comment' | 'follow' | 'mention' | 'badge' | 'xp' | 'overtake'
  message: string
  link?: string
  read: boolean
  createdAt: Date
}

export type NotificationDocument = INotification

// ============= Challenge Model Types =============

export interface IWeeklyChallenge extends Document {
  _id: Types.ObjectId
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  startDate: Date
  endDate: Date
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  participants: Types.ObjectId[]
  submissions: Array<{
    user: Types.ObjectId
    solution: string
    language: string
    passed: boolean
    submittedAt: Date
  }>
  isActive: boolean
  createdAt: Date
}

export type WeeklyChallengeDocument = IWeeklyChallenge

// ============= Analytics Model Types =============

export interface IAnalytics extends Document {
  _id: Types.ObjectId
  date: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalPosts: number
    newPosts: number
    totalComments: number
    totalLikes: number
    totalViews: number
  }
  createdAt: Date
}

export type AnalyticsDocument = IAnalytics

// ============= Activity Model Types =============

export interface IActivity extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  type: 'post' | 'comment' | 'like' | 'follow' | 'login' | 'xp_gain'
  targetType?: 'post' | 'comment' | 'user'
  targetId?: Types.ObjectId
  xpGained?: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type ActivityDocument = IActivity

// ============= Referral Model Types =============

export interface IReferral extends Document {
  _id: Types.ObjectId
  referrer: Types.ObjectId
  referred: Types.ObjectId
  code: string
  status: 'pending' | 'completed' | 'expired'
  rewardClaimed: boolean
  completedAt?: Date
  createdAt: Date
}

export type ReferralDocument = IReferral

// ============= Report Model Types =============

export interface IReport extends Document {
  _id: Types.ObjectId
  reporter: Types.ObjectId
  targetType: 'post' | 'comment' | 'user'
  targetId: Types.ObjectId
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy?: Types.ObjectId
  reviewNote?: string
  createdAt: Date
  updatedAt: Date
}

export type ReportDocument = IReport

// ============= Message Model Types =============

export interface IMessage extends Document {
  _id: Types.ObjectId
  conversation: Types.ObjectId
  sender: Types.ObjectId
  content: string
  imageUrl?: string
  read: boolean
  readAt?: Date
  createdAt: Date
}

export type MessageDocument = IMessage

// ============= Conversation Model Types =============

export interface IConversation extends Document {
  _id: Types.ObjectId
  participants: Types.ObjectId[]
  lastMessage?: Types.ObjectId
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type ConversationDocument = IConversation

// ============= Populate Types =============

export interface PopulatedPost extends Omit<IPost, 'author'> {
  author: IUser
}

export interface PopulatedComment extends Omit<IComment, 'author' | 'post'> {
  author: IUser
  post: IPost
}

export interface PopulatedNotification extends Omit<INotification, 'actor' | 'recipient'> {
  actor?: IUser
  recipient: IUser
}

// ============= Aggregation Result Types =============

export interface UserStatsAggregation {
  _id: Types.ObjectId
  totalPosts: number
  totalLikes: number
  totalComments: number
  avgEngagement: number
}

export interface TrendingPostAggregation {
  _id: Types.ObjectId
  post: IPost
  score: number
  engagementRate: number
}

export interface LeaderboardAggregation {
  _id: Types.ObjectId
  user: IUser
  xp: number
  level: number
  rank: number
}
