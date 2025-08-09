"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FollowState {
  [userId: string]: {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
  };
}

interface FollowContextType {
  followState: FollowState;
  updateFollowState: (userId: string, isFollowing: boolean, followersCount?: number, followingCount?: number) => void;
  getFollowState: (userId: string) => { isFollowing: boolean; followersCount: number; followingCount: number } | null;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [followState, setFollowState] = useState<FollowState>({});

  const updateFollowState = useCallback((
    userId: string, 
    isFollowing: boolean, 
    followersCount?: number, 
    followingCount?: number
  ) => {
    setFollowState(prev => {
      const currentState = prev[userId] || { isFollowing: false, followersCount: 0, followingCount: 0 };
      return {
        ...prev,
        [userId]: {
          isFollowing,
          followersCount: followersCount !== undefined ? followersCount : currentState.followersCount,
          followingCount: followingCount !== undefined ? followingCount : currentState.followingCount,
        }
      };
    });
  }, []);

  const getFollowState = useCallback((userId: string) => {
    return followState[userId] || null;
  }, [followState]);

  return (
    <FollowContext.Provider value={{ followState, updateFollowState, getFollowState }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}