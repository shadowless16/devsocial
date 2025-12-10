// components/auth/auth-wrapper.tsx
"use client";

import React, { memo, useMemo } from 'react';
import { useAuth } from '@/contexts/app-context';

interface AuthWrapperProps {
  children: (auth: { user: unknown; loading: boolean }) => React.ReactNode;
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
  }), [user, loading]); // Only re-create when user or loading state changes
  
  return <>{children(authState)}</>;
});

AuthWrapper.displayName = 'AuthWrapper';

/**
 * HOC version for class components or when you prefer HOC pattern
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: unknown; loading: boolean }>
) {
  const WrappedComponent = memo((props: P) => {
    const { user, loading } = useAuth();
    return <Component {...props} user={user} loading={loading} />;
  });

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
