"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FollowListModal } from '@/components/shared/FollowListModal';
import { getConnectionText, GAMIFIED_TERMS } from '@/lib/ui/gamified-terms';

interface FollowStatsProps {
  userId: string;
  username: string;
  initialFollowersCount: number;
  initialFollowingCount: number;
  className?: string;
}

export function FollowStats({
  username,
  initialFollowersCount,
  initialFollowingCount,
  className = "",
}: FollowStatsProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"followers" | "following">("followers");
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);

  // Update counts from props when they change
  useEffect(() => {
    setFollowersCount(initialFollowersCount);
    setFollowingCount(initialFollowingCount);
  }, [initialFollowersCount, initialFollowingCount]);

  // Disable WebSocket listeners since we're using optimistic updates from props

  const handleFollowersClick = () => {
    setModalTab("followers");
    setShowFollowModal(true);
  };

  const handleFollowingClick = () => {
    setModalTab("following");
    setShowFollowModal(true);
  };



  return (
    <>
      <div className={`flex items-center space-x-3 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFollowersClick}
          className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-1"
        >
          <span className="font-semibold text-sm">{followersCount}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {getConnectionText(followersCount)}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleFollowingClick}
          className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-1"
        >
          <span className="font-semibold text-sm">{followingCount}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">{GAMIFIED_TERMS.FOLLOWING_LIST}</span>
        </Button>
      </div>

      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        username={username}
        initialTab={modalTab}
        followersCount={followersCount}
        followingCount={followingCount}
      />
    </>
  );
}