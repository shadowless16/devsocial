"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { apiClient } from "@/lib/api-client";


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
  role: "user" | "moderator" | "admin";
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
    if (fetchingRef.current) return;
    
    // Check if we recently fetched (within 2 minutes for better UX)
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 2 * 60 * 1000) {
      if (userCacheRef.current) {
        setUser(userCacheRef.current);
        setLoading(false);
        return;
      }
    }
    
    fetchingRef.current = true;
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        apiClient.getCurrentUserProfile<{ user: any }>(),
        timeoutPromise
      ]) as any;
      
      if (response.success && response.data?.user) {
        const points = response.data.user.points || 0;
        const level = Math.floor(points / 1000) + 1;
        const totalXpForLevel = level * 1000;
        const xpToNext = totalXpForLevel - points;

        const newUser: User = {
          id: response.data.user._id.toString(),
          username: response.data.user.username,
          email: response.data.user.email,
          bio: response.data.user.bio || '',
          affiliation: response.data.user.affiliation || '',
          avatar: response.data.user.avatar || '/placeholder.svg',
          bannerUrl: response.data.user.bannerUrl || '',
          role: response.data.user.role,
          points,
          badges: response.data.user.badges || [],
          level: response.data.user.level || level,
          isVerified: response.data.user.isVerified || false,
          displayName: response.data.user.displayName || response.data.user.username,
          location: response.data.user.location,
          website: response.data.user.website,
          verificationToken: response.data.user.verificationToken,
          verificationTokenExpires: response.data.user.verificationTokenExpires,
          resetPasswordToken: response.data.user.resetPasswordToken,
          resetPasswordExpires: response.data.user.resetPasswordExpires,
          refreshTokens: response.data.user.refreshTokens || [],
          lastLogin: response.data.user.lastLogin,
          loginStreak: response.data.user.loginStreak || 0,
          lastStreakDate: response.data.user.lastStreakDate,
          onboardingCompleted: response.data.user.onboardingCompleted || false,
          xpToNext: xpToNext >= 0 ? xpToNext : 0,
          totalXpForLevel,
        };
        
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
        throw new Error('No user data in response');
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw error; // Re-throw to trigger fallback
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log('Authenticated, fetching user profile...');
      fetchUserWithCache().catch((error) => {
        console.log('Profile fetch failed, using fallback:', error.message);
        const basicUser: User = {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          bio: '',
          affiliation: '',
          avatar: '/placeholder.svg',
          bannerUrl: '',
          role: session.user.role as "user" | "moderator" | "admin",
          points: 0,
          badges: [],
          level: 1,
          isVerified: false,
          displayName: session.user.username,
          refreshTokens: [],
          loginStreak: 0,
          onboardingCompleted: true,
          xpToNext: 1000,
          totalXpForLevel: 1000,
        };
        setUser(basicUser);
        setLoading(false);
      });
    } else if (status === "unauthenticated") {
      setUser(null);
      userCacheRef.current = null;
      lastFetchRef.current = 0;
      setLoading(false);
    } else if (status === "loading") {
      return;
    } else {
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
      
      if (!response.success) {
        // Extract detailed error message
        const errorMessage = response.message || "Signup failed";
        throw new Error(errorMessage);
      }
      
      // After successful signup, automatically log the user in
      if (response.data && (response.data as any).token && (response.data as any).user) {
        console.log('Signup successful, attempting login...');
        const result = await signIn("credentials", {
          usernameOrEmail: userData.email,
          password: userData.password,
          redirect: false,
        });
        
        if (result?.error) {
          throw new Error("Account created successfully! Please log in manually.");
        }
        
        console.log('Auto-login successful');
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