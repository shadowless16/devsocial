"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { apiClient } from '@/lib/api/api-client';
import { useSessionCache } from './session-cache-context';

// User type definition
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio: string;
  affiliation: string;
  avatar: string;
  bannerUrl: string;
  role: "user" | "moderator" | "admin" | "analytics";
  points: number;
  badges: string[];
  level: number;
  isVerified: boolean;
  displayName?: string;
  location?: string;
  website?: string;
  refreshTokens: string[];
  loginStreak: number;
  onboardingCompleted: boolean;
  demoWalletBalance?: number;
  xpToNext: number;
  totalXpForLevel: number;
}

// Unified App State
interface AppState {
  // Auth state
  user: User | null;
  authLoading: boolean;
  
  // Posts state
  posts: unknown[];
  postsLoading: boolean;
  
  // Follow state
  followState: { [userId: string]: { isFollowing: boolean; followersCount: number; followingCount: number } };
  
  // Notifications state
  notifications: unknown[];
  unreadCount: number;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_POSTS'; payload: unknown[] }
  | { type: 'ADD_POST'; payload: unknown }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: unknown } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_POSTS_LOADING'; payload: boolean }
  | { type: 'UPDATE_FOLLOW_STATE'; payload: { userId: string; isFollowing: boolean; followersCount?: number; followingCount?: number } }
  | { type: 'SET_NOTIFICATIONS'; payload: unknown[] }
  | { type: 'ADD_NOTIFICATION'; payload: unknown }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' };

// Initial state
const initialState: AppState = {
  user: null,
  authLoading: true,
  posts: [],
  postsLoading: false,
  followState: {},
  notifications: [],
  unreadCount: 0,
  theme: 'system',
  sidebarOpen: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post => {
          const p = post as { id: string }
          return p.id === action.payload.id ? { ...(post as Record<string, unknown>), ...(action.payload.updates as Record<string, unknown>) } : post
        }),
      };
    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter(post => (post as { id: string }).id !== action.payload) };
    case 'SET_POSTS_LOADING':
      return { ...state, postsLoading: action.payload };
    case 'UPDATE_FOLLOW_STATE':
      return {
        ...state,
        followState: {
          ...state.followState,
          [action.payload.userId]: {
            isFollowing: action.payload.isFollowing,
            followersCount: action.payload.followersCount ?? state.followState[action.payload.userId]?.followersCount ?? 0,
            followingCount: action.payload.followingCount ?? state.followState[action.payload.userId]?.followingCount ?? 0,
          },
        },
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Auth actions
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  signup: (userData: unknown) => Promise<void>;
  
  // Posts actions
  fetchPosts: (page?: number, reset?: boolean) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Follow actions
  toggleFollow: (userId: string) => Promise<void>;
  
  // UI actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { clearCache } = useSessionCache();
  const { data: session, status } = useSession();

  // Auth actions
  const login = useCallback(async (credentials: { usernameOrEmail: string; password: string }) => {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    
    if (result?.error) {
      throw new Error(result.error || 'Login failed');
    }
    
    window.location.href = '/home';
  }, []);

  const signup = useCallback(async (userData: unknown) => {
    try {
      const response = await apiClient.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      }) as any;
      
      const hasUserData = response?.data?.user || response?.user || response?.data?.id || response?.id;
      const isSuccess = response?.success === true || response?.status === 'success' || response?.message?.includes('success') || hasUserData;
      
      if (!isSuccess && response?.error) {
        const err: any = new Error(response?.message || response?.error || "Signup failed");
        err.error = response?.error;
        throw err;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Signup error:', errorMessage);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      dispatch({ type: 'SET_USER', payload: null });
      clearCache();
      window.location.href = '/auth/login';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Logout error:', errorMessage);
    }
  }, [clearCache]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (state.user) {
      dispatch({ type: 'SET_USER', payload: { ...state.user, ...userData } });
    }
  }, [state.user]);

  // Sync session with App State
  useEffect(() => {
    const loadFullProfile = async () => {
      if (status === 'authenticated' && session?.user) {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
        try {
          // Use apiClient with backend token already configured via NextAuth
          const response = await apiClient.getCurrentUserProfile<any>();
          
          if (response.success && response.data?.user) {
            const userData = response.data.user;
            const user: User = {
              id: userData._id?.toString() || userData.id,
              username: userData.username,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              bio: userData.bio || '',
              affiliation: userData.affiliation || '',
              avatar: userData.avatar || '',
              bannerUrl: userData.bannerUrl || '',
              role: userData.role || 'user',
              points: userData.points || 0,
              badges: userData.badges || [],
              level: userData.level || 1,
              isVerified: userData.isVerified || false,
              displayName: userData.displayName || userData.username,
              location: userData.location,
              website: userData.website,
              refreshTokens: userData.refreshTokens || [],
              loginStreak: userData.loginStreak || 0,
              onboardingCompleted: userData.onboardingCompleted === true,
              demoWalletBalance: userData.demoWalletBalance || 100,
              xpToNext: userData.xpToNext || 0,
              totalXpForLevel: userData.totalXpForLevel || 1000,
            };
            dispatch({ type: 'SET_USER', payload: user });
          }
        } catch (error) {
          console.error('Failed to load full profile:', error);
          // Fallback to basic session info if profile fetch fails
          const basicUser: User = {
            id: session.user.id,
            username: (session.user as any).username || 'User',
            email: session.user.email || '',
            role: (session.user as any).role || 'user',
            bio: '',
            affiliation: '',
            avatar: '',
            bannerUrl: '',
            points: 0,
            badges: [],
            level: 1,
            isVerified: false,
            refreshTokens: [],
            loginStreak: 0,
            onboardingCompleted: false,
            xpToNext: 0,
            totalXpForLevel: 1000
          };
          dispatch({ type: 'SET_USER', payload: basicUser });
        } finally {
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        }
      } else if (status === 'unauthenticated') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      } else if (status === 'loading') {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      }
    };

    loadFullProfile();
  }, [session, status]);

  // Posts actions
  const fetchPosts = useCallback(async (page = 1, reset = false) => {
    dispatch({ type: 'SET_POSTS_LOADING', payload: true });
    try {
      const response = await apiClient.getPosts({ page: page.toString(), limit: '10' });
      if (response.success && response.data) {
        const posts = (response.data as { posts?: unknown[] })?.posts || [];
        if (reset) {
          dispatch({ type: 'SET_POSTS', payload: posts });
        } else {
          dispatch({ type: 'SET_POSTS', payload: [...state.posts, ...posts] });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Failed to fetch posts:', errorMessage);
    } finally {
      dispatch({ type: 'SET_POSTS_LOADING', payload: false });
    }
  }, [state.posts]);

  const likePost = useCallback(async (postId: string) => {
    try {
      const response = await apiClient.togglePostLike(postId);
      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_POST',
          payload: {
            id: postId,
            updates: {
              isLiked: (response.data as { liked?: boolean })?.liked,
              likesCount: (response.data as { likesCount?: number })?.likesCount,
            },
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Failed to like post:', errorMessage);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await apiClient.deletePost(postId);
      if (response.success) {
        dispatch({ type: 'DELETE_POST', payload: postId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Failed to delete post:', errorMessage);
    }
  }, []);

  // Follow actions
  const toggleFollow = useCallback(async (userId: string) => {
    try {
      const currentState = state.followState[userId];
      const isCurrentlyFollowing = currentState?.isFollowing || false;
      
      const response = isCurrentlyFollowing 
        ? await apiClient.unfollowUser(userId)
        : await apiClient.followUser(userId);
        
      if (response.success) {
        dispatch({
          type: 'UPDATE_FOLLOW_STATE',
          payload: {
            userId,
            isFollowing: !isCurrentlyFollowing,
            followersCount: (currentState?.followersCount || 0) + (isCurrentlyFollowing ? -1 : 1),
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Failed to toggle follow:', errorMessage);
    }
  }, [state.followState]);

  // UI actions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  // Fetch notification count
  useEffect(() => {
    if (state.user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await apiClient.request<any>('/notifications?unread=true&limit=1')
          if (response.success && response.data) {
            dispatch({ type: 'SET_UNREAD_COUNT', payload: response.data.unreadCount || 0 })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Operation failed';
          console.error('Failed to fetch unread count:', errorMessage)
        }
      }
      
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 120000)
      return () => clearInterval(interval)
    }
  }, [state.user])

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    signup,
    fetchPosts,
    likePost,
    deletePost,
    toggleFollow,
    toggleSidebar,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific parts of state
export function useAuth() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  const { state, updateUser, logout, signup } = context;
  const { status } = useSession();
  
  return {
    user: state.user,
    loading: state.authLoading,
    isAuthenticated: !!state.user && status === 'authenticated',
    status: status,
    updateUser,
    logout,
    signup,
  };
}

export function usePosts() {
  const { state, fetchPosts, likePost, deletePost } = useApp();
  return {
    posts: state.posts,
    loading: state.postsLoading,
    fetchPosts,
    likePost,
    deletePost,
  };
}

export function useFollow() {
  const { state, toggleFollow } = useApp();
  return {
    followState: state.followState,
    toggleFollow,
    getFollowState: (userId: string) => state.followState[userId] || null,
  };
}