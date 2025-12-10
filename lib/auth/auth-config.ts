// lib/auth-config.ts
"use client";

import { SessionProviderProps } from "next-auth/react";

// Centralized auth configuration
export const authConfig: Partial<SessionProviderProps> = {
  // Refetch session every 30 minutes to reduce server load
  refetchInterval: 30 * 60,
  
  // Don't refetch when window regains focus
  refetchOnWindowFocus: false,
  
  // Add refetch when the app comes back online
  refetchWhenOffline: false,
};

// Session cache configuration
export const sessionCacheConfig = {
  // Cache duration in milliseconds
  duration: 30 * 60 * 1000, // 30 minutes
  
  // Enable debug logging
  debug: process.env.NODE_ENV === "development",
};

// Rate limiting configuration for API calls
export const rateLimitConfig = {
  // Maximum requests per window
  maxRequests: 100,
  
  // Window duration in milliseconds
  windowMs: 60 * 1000, // 1 minute
  
  // Skip rate limiting for certain paths
  skipPaths: ["/api/auth/session", "/api/auth/csrf"],
};

