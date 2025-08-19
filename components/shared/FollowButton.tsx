"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/websocket-context";
import { useFollow } from "@/contexts/follow-context";
import { useAuth } from "@/contexts/auth-context";
import { getFollowActionText, getFollowingActionText, getFollowTooltip } from "@/lib/gamified-terms";

interface FollowButtonProps {
  userId: string;
  username: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  username,
  isFollowing: initialIsFollowing,
  onFollowChange,
  size = "default",
  variant = "default",
  showIcon = true,
  className = "",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { socket } = useWebSocket();
  const { updateFollowState, getFollowState } = useFollow();
  const { user } = useAuth();

  // Update local state when prop changes or from context
  useEffect(() => {
    const contextState = getFollowState(userId);
    if (contextState) {
      setIsFollowing(contextState.isFollowing);
    } else {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing, userId, getFollowState]);

  // Disable WebSocket listeners since we're using optimistic updates

  const handleFollowToggle = async () => {
    // Prevent unfollowing AkDavid
    if (username === "AkDavid" && isFollowing) {
      toast({
        title: "Cannot Unfollow",
        description: "You cannot unfollow the platform creator",
        variant: "destructive",
      });
      return;
    }

    const previousState = isFollowing;
    const newState = !isFollowing;
    const delta = newState ? 1 : -1;
    
    // Optimistic update - update UI immediately
    setIsFollowing(newState);
    updateFollowState(userId, newState);
    onFollowChange?.(newState, delta);
    
    setIsLoading(true);
    
    try {
      if (previousState) {
        // Unfollow
        await apiClient.unfollowUser(userId);
        toast({
          title: "Disconnected",
          description: `You have disconnected from @${username}`,
          variant: "default",
        });
      } else {
        // Follow
        await apiClient.followUser(userId);
        toast({
          title: "Connected",
          description: `You are now connected with @${username}`,
          variant: "default",
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFollowing(previousState);
      updateFollowState(userId, previousState);
      onFollowChange?.(previousState, -delta);
      
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        disabled
        size={size}
        variant={variant}
        className={className}
      >
        <Loader2 className={`${showIcon ? "mr-2" : ""} h-4 w-4 animate-spin`} />
        {showIcon ? `${getFollowingActionText(isFollowing)}...` : "..."}
      </Button>
    );
  }

  // Special styling for AkDavid when following
  const isAkDavidFollowing = username === "AkDavid" && isFollowing;
  const buttonVariant = isAkDavidFollowing ? "default" : (isFollowing ? "outline" : variant);
  const hoverClass = isAkDavidFollowing ? "" : (isFollowing ? "hover:bg-red-50 hover:border-red-200 hover:text-red-600" : "");
  const buttonText = isAkDavidFollowing ? "Platform Creator" : getFollowActionText(isFollowing);
  const tooltipText = isAkDavidFollowing ? "Cannot unfollow platform creator" : getFollowTooltip(isFollowing);

  return (
    <Button
      onClick={handleFollowToggle}
      size={size}
      variant={buttonVariant}
      className={`${hoverClass} ${className}`}
      title={tooltipText}
    >
      {showIcon && (
        <>
          {isFollowing ? (
            <UserMinus className="mr-2 h-4 w-4" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
        </>
      )}
      {buttonText}
    </Button>
  );
}
