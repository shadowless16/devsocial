import { useState, useEffect } from 'react';

interface MCPHookOptions {
  tool: string;
  args: Record<string, any>;
  enabled?: boolean;
}

export function useMCP<T>({ tool, args, enabled = true }: MCPHookOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, args })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, [tool, JSON.stringify(args), enabled]);

  return { data, loading, error, refetch: execute };
}

// Specific hooks for common operations
export function useUserFeed(userId: string, limit = 20) {
  return useMCP({
    tool: 'get_user_feed',
    args: { userId, limit },
    enabled: !!userId
  });
}

export function useLeaderboard(limit = 10) {
  return useMCP({
    tool: 'get_leaderboard',
    args: { limit }
  });
}