// Component type definitions

export interface UserData {
  _id: string;
  id?: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role?: string;
  isBlocked?: boolean;
  level?: number;
  points?: number;
  postsCount?: number;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

export interface CommunityData {
  _id: string;
  name: string;
  description?: string;
  longDescription?: string;
  category?: string;
  creator: string | { _id: string; toString: () => string };
  members: Array<string | { _id?: string; toString: () => string; displayName?: string; username?: string }>;
  memberCount?: number;
  postCount?: number;
  rules?: string[];
}

export interface PostData {
  _id: string;
  id?: string;
  author: {
    _id: string;
    id?: string;
    username: string;
    displayName?: string;
    avatar?: string;
    level?: number;
  };
  content: string;
  title?: string;
  excerpt?: string;
  summary?: string;
  body?: string;
  text?: string;
  tags?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  likesCount?: number;
  likes?: unknown[];
  commentsCount?: number;
  comments?: unknown[];
  viewsCount?: number;
  xpAwarded?: number;
  xp?: number;
  shares?: number;
  createdAt: string;
  isAnonymous?: boolean;
  isLiked?: boolean;
}

export interface CommentData {
  _id: string;
  id?: string;
  author: {
    username: string;
    displayName?: string;
    avatar?: string;
    level?: number;
  };
  content: string;
  likesCount?: number;
  likes?: unknown[];
  createdAt: string;
  isLiked?: boolean;
  replies?: CommentData[];
}

export interface ReportData {
  _id: string;
  status: string;
  reason: string;
  description?: string;
  createdAt: string;
  reporter: {
    avatar?: string;
    displayName?: string;
    username: string;
  };
  reportedUser: {
    avatar?: string;
    displayName?: string;
    username: string;
  };
  reportedPost?: {
    content: string;
  };
}

export interface AchievementData {
  metadata?: {
    xpEarned?: number;
  };
}

export interface MissionData {
  missions: unknown[];
}
