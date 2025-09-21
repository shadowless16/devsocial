"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { User } from './auth-context';

// Unified App State
interface AppState {
  // Auth state
  user: User | null;
  authLoading: boolean;
  
  // Posts state
  posts: any[];
  postsLoading: boolean;
  
  // Follow state
  followState: { [userId: string]: { isFollowing: boolean; followersCount: number; followingCount: number } };
  
  // Notifications state
  notifications: any[];
  unreadCount: number;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_POSTS'; payload: any[] }
  | { type: 'ADD_POST'; payload: any }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: any } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_POSTS_LOADING'; payload: boolean }
  | { type: 'UPDATE_FOLLOW_STATE'; payload: { userId: string; isFollowing: boolean; followersCount?: number; followingCount?: number } }
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'ADD_NOTIFICATION'; payload: any }
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
        posts: state.posts.map(post =>
          post.id === action.payload.id ? { ...post, ...action.payload.updates } : post
        ),
      };
    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter(post => post.id !== action.payload) };
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
  const { data: session, status } = useSession();

  // Auth actions
  const login = useCallback(async (credentials: { usernameOrEmail: string; password: string }) => {
    // Implementation handled by NextAuth
    throw new Error('Use NextAuth signIn instead');
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_USER', payload: null });
    // Implementation handled by NextAuth
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (state.user) {
      dispatch({ type: 'SET_USER', payload: { ...state.user, ...userData } });
    }
  }, [state.user]);

  // Posts actions
  const fetchPosts = useCallback(async (page = 1, reset = false) => {
    dispatch({ type: 'SET_POSTS_LOADING', payload: true });
    try {
      const response = await apiClient.getPosts({ page: page.toString(), limit: '10' });
      if (response.success && response.data) {
        const posts = (response.data as any)?.posts || [];
        if (reset) {
          dispatch({ type: 'SET_POSTS', payload: posts });
        } else {
          dispatch({ type: 'SET_POSTS', payload: [...state.posts, ...posts] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
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
              isLiked: (response.data as any)?.liked,
              likesCount: (response.data as any)?.likesCount,
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await apiClient.deletePost(postId);
      if (response.success) {
        dispatch({ type: 'DELETE_POST', payload: postId });
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
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
            followersCount: currentState?.followersCount + (isCurrentlyFollowing ? -1 : 1),
          },
        });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }, [state.followState]);

  // UI actions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  // Load user data when session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      
      apiClient.getCurrentUserProfile<{ user: any }>()
        .then(response => {
          if (response.success && response.data?.user) {
            const userData = response.data.user;
            const user: User = {
              id: userData._id?.toString() || userData.id,
              username: userData.username,
              email: userData.email,
              bio: userData.bio || '',
              affiliation: userData.affiliation || '',
              avatar: userData.avatar || '/placeholder.svg',
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
            
            // Preload frequently accessed data
            apiClient.preload('/dashboard');
            apiClient.preload('/trending');
          }
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
        })
        .finally(() => {
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        });
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      // Clear cache on logout
      apiClient.invalidateCache();
    }
  }, [status, session]);

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
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
  const { state, updateUser, logout } = useApp();
  return {
    user: state.user,
    loading: state.authLoading,
    updateUser,
    logout,
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