"use client";

import { useAuth as useAppAuth } from "@/contexts/app-context";

// Centralized auth hook that provides consistent interface
export const useAuth = () => {
  const auth = useAppAuth();
  
  return {
    user: auth.user,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    status: auth.status,
    updateUser: auth.updateUser,
    logout: auth.logout,
    signup: auth.signup,
  };
};

// Legacy compatibility
export const useSession = () => {
  const { user, loading, status } = useAuth();
  
  return {
    data: user ? { user } : null,
    status: loading ? 'loading' : status,
  };
};