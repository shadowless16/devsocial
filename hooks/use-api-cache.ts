"use client";

import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useApiCache() {
  const invalidateCache = useCallback((pattern?: string) => {
    apiClient.invalidateCache(pattern);
  }, []);

  const preloadData = useCallback(async (endpoint: string, options?: RequestInit) => {
    return apiClient.preload(endpoint, options);
  }, []);

  const refreshData = useCallback((pattern: string) => {
    // Invalidate cache and trigger re-fetch
    apiClient.invalidateCache(pattern);
    
    // Dispatch custom event for components to refetch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cache:invalidated', { 
        detail: { pattern } 
      }));
    }
  }, []);

  return {
    invalidateCache,
    preloadData,
    refreshData,
  };
}