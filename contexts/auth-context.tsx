// // contexts/auth-context.tsx
// "use client";

// import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { apiClient } from "@/lib/api-client";
// import { type IUser } from "@/models/User"; // Import the full Mongoose type

// // Define a simple, plain object type for frontend state
// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   bio: string;
//   branch: string;
//   avatar: string;
//   bannerUrl: string;
//   role: "user" | "moderator" | "admin";
//   points: number;
//   level: number;
//   displayName?: string;
//   location?: string;
//   website?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
//   logout: () => Promise<void>;
//   updateUser: (userData: Partial<User>) => void;
//   signup: (userData: any) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Helper function to map the full IUser to our simple frontend User type
// const mapApiUserData = (apiUserData: IUser): User => ({
//   id: apiUserData._id.toString(),
//   username: apiUserData.username,
//   email: apiUserData.email,
//   bio: apiUserData.bio,
//   branch: apiUserData.branch,
//   avatar: apiUserData.avatar,
//   bannerUrl: apiUserData.bannerUrl,
//   role: apiUserData.role,
//   points: apiUserData.points,
//   level: apiUserData.level,
//   displayName: apiUserData.displayName,
//   location: apiUserData.location,
//   website: apiUserData.website,
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   const logout = useCallback(async () => {
//     setUser(null);
//     await apiClient.logout();
//     window.location.href = "/auth/login";
//   }, []);

//   const fetchCurrentUser = useCallback(async () => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       setUser(null);
//       setLoading(false);
//       return;
//     }
//     try {
//       const response = await apiClient.getCurrentUserProfile<{ user: IUser }>();
//       if (response.success && response.data?.user) {
//         setUser(mapApiUserData(response.data.user));
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       setUser(null);
//       console.log("Session invalid:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCurrentUser();
//   }, [fetchCurrentUser]);

//   // Periodically check if the token is missing and log out if necessary
//   useEffect(() => {
//     const checkToken = () => {
//       const token = localStorage.getItem("access_token");
//       if (!token && user) {
//         setUser(null);
//         window.location.href = "/auth/login";
//       }
//     };
//     checkToken();
//     const interval = setInterval(checkToken, 5000); // Check every 5 seconds
//     return () => clearInterval(interval);
//   }, [user]);

//   const login = async (credentials: { usernameOrEmail: string; password: string }) => {
//     const response = await apiClient.login(credentials);
//     if (response.success && response.data?.user) {
//       setUser(mapApiUserData(response.data.user));
//     } else {
//       throw new Error(response.message || "Login failed.");
//     }
//   };

//   const updateUser = (newUserData: Partial<User>) => {
//     setUser((currentUser) => (currentUser ? { ...currentUser, ...newUserData } : null));
//   };

//   const signup = async (userData: any) => {
//     // Implement signup logic here if needed
//   };

//   const value: AuthContextType = { user, loading, login, logout, updateUser, signup };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// }

// contexts/auth-context.tsx


// contexts/auth-context.tsx
// contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { authConfig } from "@/lib/auth-config";

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
    <SessionProvider
      {...authConfig}
    >
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
    
    // Check if we recently fetched (within 5 minutes)
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 5 * 60 * 1000) {
      if (userCacheRef.current) {
        setUser(userCacheRef.current);
        setLoading(false);
        return;
      }
    }
    
    fetchingRef.current = true;
    
    try {
      const response = await apiClient.getCurrentUserProfile<{ user: any }>();
      if (response.success && response.data?.user) {
            // Calculate xpToNext and totalXpForLevel based on points and level
            const points = response.data.user.points || 0;
            const level = Math.floor(points / 1000) + 1; // Matches UserSchema.calculateLevel
            const totalXpForLevel = level * 1000; // 1000 XP per level
            const xpToNext = totalXpForLevel - points;

            const newUser: User = {
              id: response.data.user._id.toString(),
              username: response.data.user.username,
              email: response.data.user.email,
              bio: response.data.user.bio,
              affiliation: response.data.user.affiliation,
              avatar: response.data.user.avatar,
              bannerUrl: response.data.user.bannerUrl,
              role: response.data.user.role,
              points,
              badges: response.data.user.badges || [],
              level: response.data.user.level,
              isVerified: response.data.user.isVerified || false,
              displayName: response.data.user.displayName,
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
              xpToNext: xpToNext >= 0 ? xpToNext : 0, // Ensure non-negative
              totalXpForLevel,
            };
            
            setUser(newUser);
            userCacheRef.current = newUser;
            lastFetchRef.current = Date.now();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      await signOut({ redirect: false });
      window.location.href = "/auth/login";
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserWithCache();
    } else if (status === "unauthenticated") {
      setUser(null);
      userCacheRef.current = null;
      lastFetchRef.current = 0;
      setLoading(false);
    } else if (status === "loading") {
      // Don't do anything while NextAuth is determining the session
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
    const response = await apiClient.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (!response.success) {
      // Handle different error response formats
      const errorMessage = response.error?.message || response.message || "Signup failed";
      throw new Error(errorMessage);
    }
    
    // After successful signup, automatically log the user in
    if (response.data?.token && response.data?.user) {
      // Use NextAuth signIn to create a session
      const result = await signIn("credentials", {
        usernameOrEmail: userData.email,
        password: userData.password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error("Account created but login failed. Please try logging in manually.");
      }
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