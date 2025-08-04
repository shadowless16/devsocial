"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

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

  const handleFollowToggle = async () => {
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const response = await apiClient.unfollowUser(userId);
        if (response.success) {
          setIsFollowing(false);
          if (onFollowChange) {
            onFollowChange(false, -1); // Decrease count by 1
          }
          toast({
            title: "Unfollowed",
            description: `You have unfollowed @${username}`,
            variant: "default",
          });
        }
      } else {
        // Follow
        const response = await apiClient.followUser(userId);
        if (response.success) {
          setIsFollowing(true);
          if (onFollowChange) {
            onFollowChange(true, 1); // Increase count by 1
          }
          toast({
            title: "Following",
            description: `You are now following @${username}`,
            variant: "default",
          });
        }
      }
    } catch (error: any) {
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
        {showIcon ? (isFollowing ? "Unfollowing..." : "Following...") : "..."}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleFollowToggle}
      size={size}
      variant={isFollowing ? "outline" : variant}
      className={`${isFollowing ? "hover:bg-red-50 hover:border-red-200 hover:text-red-600" : ""} ${className}`}
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
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
