"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { generateAvatar } from "@/utils/avatar-generator";


// Extend the Session type to include custom user fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  affiliation: string;
  avatar: string;
  bannerUrl: string;
  role: "user" | "moderator" | "admin" | "analytics";
  gender?: "male" | "female" | "other";
  userType?: "student" | "developer" | "designer" | "entrepreneur" | "other";
  points: number;
  badges: string[];
  level: number;
  isVerified: boolean;
  displayName?: string;
  location?: string;
  website?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  loginStreak: number;
  lastStreakDate?: Date;
  onboardingCompleted: boolean;
  xpToNext: number; // Calculated field for remaining XP to next level
  totalXpForLevel: number; // Calculated field for total XP required for current level
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  signup: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const userCacheRef = useRef<User | null>(null);

  const fetchUserWithCache = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    // Check if we recently fetched (within 2 minutes for better UX)
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 2 * 60 * 1000) {
      if (userCacheRef.current) {
        console.log('Using cached user data');
        setUser(userCacheRef.current);
        setLoading(false);
        return;
      }
    }
    
    fetchingRef.current = true;
    console.log('Starting user profile fetch...');
    
    try {
      // Add timeout to prevent hanging requests - increased to 15 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      );
      
      console.log('Making API call to /api/users/profile...');
      let response;
      try {
        response = await Promise.race([
          apiClient.getCurrentUserProfile<{ user: any }>(),
          timeoutPromise
        ]) as any;
      } catch (profileError: any) {
        console.log('Primary profile API failed, trying fallback /api/profile...');
        try {
          response = await Promise.race([
            apiClient.getProfile<{ profile: any }>(),
            timeoutPromise
          ]) as any;
          // Transform profile response to match expected format
          if (response?.profile) {
            response = {
              success: true,
              data: { user: response.profile }
            };
          }
        } catch (fallbackError: any) {
          console.error('Both profile APIs failed:', { primary: profileError.message, fallback: fallbackError.message });
          throw profileError; // Throw original error
        }
      }
      
      console.log('API response received:', { success: response?.success, hasUser: !!response?.data?.user });
      
      if (response?.success && response?.data?.user) {
        const userData = response.data.user;
        const points = userData.points || 0;
        const level = Math.floor(points / 1000) + 1;
        const totalXpForLevel = level * 1000;
        const xpToNext = totalXpForLevel - points;

        const newUser: User = {
          id: userData._id?.toString() || userData.id,
          username: userData.username,
          email: userData.email,
          bio: userData.bio || '',
          affiliation: userData.affiliation || '',
          avatar: userData.avatar || '/placeholder.svg',
          bannerUrl: userData.bannerUrl || '',
          role: userData.role || 'user',
          points,
          badges: userData.badges || [],
          level: userData.level || level,
          isVerified: userData.isVerified || false,
          displayName: userData.displayName || userData.username,
          location: userData.location,
          website: userData.website,
          verificationToken: userData.verificationToken,
          verificationTokenExpires: userData.verificationTokenExpires,
          resetPasswordToken: userData.resetPasswordToken,
          resetPasswordExpires: userData.resetPasswordExpires,
          refreshTokens: userData.refreshTokens || [],
          lastLogin: userData.lastLogin,
          loginStreak: userData.loginStreak || 0,
          lastStreakDate: userData.lastStreakDate,
          onboardingCompleted: userData.onboardingCompleted !== false, // Default to true if not specified
          xpToNext: xpToNext >= 0 ? xpToNext : 0,
          totalXpForLevel,
        };
        
        console.log('User profile loaded successfully:', { id: newUser.id, username: newUser.username, role: newUser.role, avatar: newUser.avatar });
        console.log('Raw userData.avatar:', userData.avatar);
        setUser(newUser);
        userCacheRef.current = newUser;
        lastFetchRef.current = Date.now();
        setLoading(false);
        
        // Check if user needs onboarding (only redirect if not already on onboarding page)
        if (!newUser.onboardingCompleted && typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
          console.log('User needs onboarding, redirecting...');
          window.location.href = '/onboarding';
        }
      } else {
        console.error('Invalid API response:', response);
        throw new Error('No user data in response');
      }
    } catch (error: any) {
      console.error("Failed to fetch user:", error?.message || error);
      throw error; // Re-throw to trigger fallback
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('Auth effect triggered:', { status, hasSession: !!session, userId: session?.user?.id });
    
    if (status === "authenticated" && session?.user?.id) {
      console.log('Authenticated, fetching user profile...');
      fetchUserWithCache().catch((error) => {
        console.log('Profile fetch failed, using fallback:', error?.message || error);
        
        // Create fallback user with session data
        const basicUser: User = {
          id: session.user.id,
          username: session.user.username || 'Unknown',
          email: session.user.email || '',
          bio: '',
          affiliation: '',
          avatar: '/placeholder.svg',
          bannerUrl: '',
          role: (session.user.role as "user" | "moderator" | "admin" | "analytics") || 'user',
          points: 0,
          badges: [],
          level: 1,
          isVerified: false,
          displayName: session.user.username || 'Unknown',
          refreshTokens: [],
          loginStreak: 0,
          onboardingCompleted: true,
          xpToNext: 1000,
          totalXpForLevel: 1000,
        };
        
        console.log('Using fallback user:', { id: basicUser.id, username: basicUser.username, role: basicUser.role });
        setUser(basicUser);
        userCacheRef.current = basicUser;
        setLoading(false);
      });
    } else if (status === "unauthenticated") {
      console.log('User unauthenticated, clearing user data');
      setUser(null);
      userCacheRef.current = null;
      lastFetchRef.current = 0;
      setLoading(false);
    } else if (status === "loading") {
      console.log('Auth status loading...');
      return;
    } else {
      console.log('Unknown auth status:', status);
      setLoading(false);
    }
  }, [status, session, fetchUserWithCache]);

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    const result = await signIn("credentials", {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password,
      redirect: false,
    });
    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut({ redirect: false });
    window.location.href = "/auth/login";
  };

  const updateUser = (newUserData: Partial<User>) => {
    setUser((currentUser) => (currentUser ? { ...currentUser, ...newUserData } : null));
  };

  const signup = async (userData: any) => {
    try {
      const response = await apiClient.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      
      console.log('Signup API response:', response);
      
      // Check if signup succeeded - API returns success: true OR has user data
      const hasUserData = response?.data?.user || (response as any)?.user;
      const isSuccess = response?.success === true || hasUserData;
      
      if (!isSuccess) {
        const error: any = new Error(response?.message || "Signup failed");
        if ((response as any)?.error) {
          error.error = (response as any).error;
        }
        throw error;
      }
      
      // After successful signup, automatically log the user in
      const tokenData = response?.data || response;
      if (tokenData?.token && hasUserData) {
        const result = await signIn("credentials", {
          usernameOrEmail: userData.email,
          password: userData.password,
          redirect: false,
        });
        
        if (result?.error) {
          throw new Error("Account created successfully! Please log in manually.");
        }
      } else {
        throw new Error("Account created but missing login data. Please log in manually.");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const value: AuthContextType = { user, loading, login, logout, updateUser, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}