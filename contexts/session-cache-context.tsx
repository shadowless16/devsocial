"use client";

import React, { createContext, useContext, useCallback, useRef } from "react";

interface SessionCache {
  data: unknown;
  timestamp: number;
}

interface SessionCacheContextType {
  getCachedSession: () => any | null;
  setCachedSession: (session: unknown) => void;
  clearCache: () => void;
}

const SessionCacheContext = createContext<SessionCacheContextType | undefined>(undefined);

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for better UX

export function SessionCacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<SessionCache | null>(null);

  const getCachedSession = useCallback(() => {
    if (!cacheRef.current) return null;
    
    const now = Date.now();
    const cacheAge = now - cacheRef.current.timestamp;
    
    // If cache is older than duration, clear it
    if (cacheAge > CACHE_DURATION) {
      cacheRef.current = null;
      return null;
    }
    
    return cacheRef.current.data;
  }, []);

  const setCachedSession = useCallback((session: unknown) => {
    cacheRef.current = {
      data: session,
      timestamp: Date.now(),
    };
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  const value: SessionCacheContextType = {
    getCachedSession,
    setCachedSession,
    clearCache,
  };

  return (
    <SessionCacheContext.Provider value={value}>
      {children}
    </SessionCacheContext.Provider>
  );
}

export function useSessionCache() {
  const context = useContext(SessionCacheContext);
  if (context === undefined) {
    throw new Error("useSessionCache must be used within a SessionCacheProvider");
  }
  return context;
}
