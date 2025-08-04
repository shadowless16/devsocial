// lib/request-dedup.ts
"use client";

type PendingRequest = {
  promise: Promise<any>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();
const DEDUP_WINDOW = 1000; // 1 second deduplication window

/**
 * Deduplicates requests to the same endpoint within a time window
 * This prevents multiple components from making the same request simultaneously
 */
export async function deduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const pending = pendingRequests.get(key);
  
  // If there's a pending request within the dedup window, return it
  if (pending && (now - pending.timestamp) < DEDUP_WINDOW) {
    return pending.promise;
  }
  
  // Create new request
  const promise = requestFn().finally(() => {
    // Clean up after request completes
    setTimeout(() => {
      pendingRequests.delete(key);
    }, 100);
  });
  
  pendingRequests.set(key, { promise, timestamp: now });
  return promise;
}

/**
 * Wrapper for session-related requests
 */
export function deduplicatedSessionRequest<T>(
  requestFn: () => Promise<T>
): Promise<T> {
  return deduplicatedRequest('session', requestFn);
}

/**
 * Wrapper for user profile requests
 */
export function deduplicatedUserRequest<T>(
  userId: string,
  requestFn: () => Promise<T>
): Promise<T> {
  return deduplicatedRequest(`user:${userId}`, requestFn);
}
