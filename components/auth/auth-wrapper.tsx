// components/auth/auth-wrapper.tsx
"use client";

import React, { memo, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface AuthWrapperProps {
  children: (auth: { user: any; loading: boolean }) => React.ReactNode;
}

/**
 * Memoized wrapper component that prevents unnecessary re-renders
 * when auth state hasn't actually changed
 */
export const AuthWrapper = memo(({ children }: AuthWrapperProps) => {
  const { user, loading } = useAuth();
  
  // Memoize the auth object to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    user,
    loading
  }), [user?.id, loading]); // Only re-create when user ID or loading state changes
  
  return <>{children(authState)}</>;
});

AuthWrapper.displayName = 'AuthWrapper';

/**
 * HOC version for class components or when you prefer HOC pattern
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: any; loading: boolean }>
) {
  return memo((props: P) => {
    const { user, loading } = useAuth();
    return <Component {...props} user={user} loading={loading} />;
  });
}
