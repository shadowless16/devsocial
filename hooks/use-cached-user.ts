// hooks/use-cached-user.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

interface CachedUser {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const userCache = new Map<string, CachedUser>();

export function useCachedUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "loading" || fetchingRef.current) return;
      
      if (status === "authenticated" && session?.user?.id) {
        const userId = session.user.id;
        const cached = userCache.get(userId);
        
        // Check if we have valid cached data
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setUser(cached.data);
          setLoading(false);
          return;
        }

        // Prevent multiple simultaneous fetches
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
          const response = await apiClient.getCurrentUserProfile<{ user: any }>();
          if (response.success && response.data?.user) {
            const userData = response.data.user;
            
            // Cache the user data
            userCache.set(userId, {
              data: userData,
              timestamp: Date.now()
            });
            
            setUser(userData);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          fetchingRef.current = false;
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [status, session]);

  // Function to manually refresh user data
  const refreshUser = async () => {
    if (session?.user?.id) {
      userCache.delete(session.user.id);
      fetchingRef.current = false;
      const response = await apiClient.getCurrentUserProfile<{ user: any }>();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        userCache.set(session.user.id, {
          data: userData,
          timestamp: Date.now()
        });
        setUser(userData);
      }
    }
  };

  return { user, loading, refreshUser };
}
