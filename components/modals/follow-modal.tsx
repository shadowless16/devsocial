"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { User as UserType } from '@/contexts/app-context';

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  username: string;
}

export function FollowModal({ isOpen, onClose, type, username }: FollowModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFollows = async () => {
      setLoading(true);
      try {
        console.log(`[FollowModal] fetching ${type} for username=`, username);
        if (type === 'followers') {
          const response = await apiClient.getFollowers<any>(username, { limit: '100' });
          console.log('[FollowModal] followers response=', response);
          if (response.success && response.data) {
            setUsers(response.data.followers || []);
            setTotalCount(response.data.pagination?.totalCount ?? null);
          } else {
            setUsers([]);
            setTotalCount(null);
          }
        } else {
          const response = await apiClient.getFollowing<any>(username, { limit: '100' });
          console.log('[FollowModal] following response=', response);
          if (response.success && response.data) {
            setUsers(response.data.following || []);
            setTotalCount(response.data.pagination?.totalCount ?? null);
          } else {
            setUsers([]);
            setTotalCount(null);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} for ${username}`, error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollows();
  }, [isOpen, type, username]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
          <DialogDescription>
            Users {type === 'followers' ? 'who follow' : 'followed by'} this user.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    user={{
                      username: user.username || '',
                      avatar: user.avatar,
                      displayName: user.displayName
                    }}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold">{user.displayName || user.username}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))
          ) : (
            <>
              <p>No users to display.</p>
              {totalCount !== null && totalCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">Server reports {totalCount} users — data may still be synchronizing. Try refreshing the page.</p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Provide a default export for compatibility with existing imports
export default FollowModal
