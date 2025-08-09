"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserLink } from "@/components/shared/UserLink";
import { FollowButton } from "@/components/shared/FollowButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Search, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  bio: string;
  followedAt: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  initialTab?: "followers" | "following";
  followersCount: number;
  followingCount: number;
}

export function FollowListModal({
  isOpen,
  onClose,
  username,
  initialTab = "followers",
  followersCount,
  followingCount,
}: FollowListModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFollowers, setFilteredFollowers] = useState<User[]>([]);
  const [filteredFollowing, setFilteredFollowing] = useState<User[]>([]);
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (isOpen && activeTab === "followers" && followers.length === 0) {
      fetchFollowers();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === "following" && following.length === 0) {
      fetchFollowing();
    }
  }, [isOpen, activeTab]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers(followers);
      setFilteredFollowing(following);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFollowers(
        followers.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.displayName.toLowerCase().includes(query) ||
            (user.bio && user.bio.toLowerCase().includes(query))
        )
      );
      setFilteredFollowing(
        following.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.displayName.toLowerCase().includes(query) ||
            (user.bio && user.bio.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, followers, following]);

  const fetchFollowers = async (page = 1) => {
    setLoadingFollowers(true);
    try {
      console.log('Fetching followers for:', username);
      const response = await apiClient.getFollowers<{
        followers: User[];
        pagination: { hasMore: boolean };
      }>(username, { page: page.toString(), limit: "20" });

      console.log('Followers response:', response);
      console.log('Response data:', response.data);
      if (response.success && response.data) {
        if (page === 1) {
          setFollowers(response.data.followers);
        } else {
          setFollowers(prev => [...prev, ...response.data.followers]);
        }
        setHasMoreFollowers(response.data.pagination.hasMore);
        setFollowersPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch followers:", error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async (page = 1) => {
    setLoadingFollowing(true);
    try {
      console.log('Fetching following for:', username);
      const response = await apiClient.getFollowing<{
        following: User[];
        pagination: { hasMore: boolean };
      }>(username, { page: page.toString(), limit: "20" });

      console.log('Following response:', response);
      console.log('Response data:', response.data);
      if (response.success && response.data) {
        if (page === 1) {
          setFollowing(response.data.following);
        } else {
          setFollowing(prev => [...prev, ...response.data.following]);
        }
        setHasMoreFollowing(response.data.pagination.hasMore);
        setFollowingPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch following:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "followers" | "following");
    if (tab === "followers" && followers.length === 0) {
      fetchFollowers();
    } else if (tab === "following" && following.length === 0) {
      fetchFollowing();
    }
  };

  const loadMoreFollowers = () => {
    if (!loadingFollowers && hasMoreFollowers) {
      fetchFollowers(followersPage + 1);
    }
  };

  const loadMoreFollowing = () => {
    if (!loadingFollowing && hasMoreFollowing) {
      fetchFollowing(followingPage + 1);
    }
  };

  const renderUserList = (users: User[], loading: boolean, hasMore: boolean, loadMore: () => void) => {
    if (loading && users.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (users.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No {activeTab} found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <UserLink username={user.username}>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </UserLink>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <UserLink username={user.username}>
                    <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                      {user.displayName}
                    </h3>
                  </UserLink>
                  <Badge variant="outline" className="text-xs">
                    L{user.level}
                  </Badge>
                </div>
                <UserLink username={user.username}>
                  <p className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                    @{user.username}
                  </p>
                </UserLink>
                {user.bio && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
            
            {/* Show follow button only if it's not the current user */}
            {currentUser && currentUser.username !== user.username && (
              <FollowButton
                userId={user._id}
                username={user.username}
                isFollowing={false}
                size="sm"
                showIcon={false}
              />
            )}
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center py-4">
            <Button
              onClick={loadMore}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle>@{username}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followersCount})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <TabsContent value="followers" className="mt-4 max-h-96 overflow-y-auto">
            {searchQuery ? (
              renderUserList(filteredFollowers, false, false, () => {})
            ) : (
              renderUserList(followers, loadingFollowers, hasMoreFollowers, loadMoreFollowers)
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-4 max-h-96 overflow-y-auto">
            {searchQuery ? (
              renderUserList(filteredFollowing, false, false, () => {})
            ) : (
              renderUserList(following, loadingFollowing, hasMoreFollowing, loadMoreFollowing)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
