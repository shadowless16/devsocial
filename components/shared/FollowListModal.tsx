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
import { GAMIFIED_TERMS } from "@/lib/gamified-terms";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  bio: string;
  followedAt: string;
  isFollowing?: boolean;
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
  const [userFollowStates, setUserFollowStates] = useState<Record<string, boolean>>({});
  
  const { user: currentUser } = useAuth();

  // Fetch current user's following list to determine follow states
  useEffect(() => {
    if (currentUser && isOpen) {
      apiClient.getFollowing<{
        following: User[];
        pagination: { hasMore: boolean };
      }>(currentUser.username, { limit: "1000" })
        .then(response => {
          if (response.success && response.data) {
            const followStates: Record<string, boolean> = {};
            response.data.following.forEach(user => {
              followStates[user._id] = true;
            });
            setUserFollowStates(followStates);
          }
        })
        .catch(console.error);
    }
  }, [currentUser, isOpen, username]);

  useEffect(() => {
    if (isOpen && activeTab === "followers") {
      // Always fetch when modal opens or tab changes to followers
      fetchFollowers();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === "following") {
      // Always fetch when modal opens or tab changes to following
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
      const response = await apiClient.getFollowers<{
        followers: User[];
        pagination: { hasMore: boolean };
      }>(username, { page: page.toString(), limit: "20" });
      
      if (response.success && response.data) {
        const followersData = response.data.followers || [];
        if (page === 1) {
          setFollowers(followersData);
        } else {
          setFollowers(prev => [...prev, ...followersData]);
        }
        setHasMoreFollowers(response.data.pagination?.hasMore || false);
        setFollowersPage(page);
      } else {
        setFollowers([]);
        setHasMoreFollowers(false);
      }
    } catch (error) {
      console.error("Failed to fetch followers:", error);
      setFollowers([]);
      setHasMoreFollowers(false);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async (page = 1) => {
    setLoadingFollowing(true);
    try {
      const response = await apiClient.getFollowing<{
        following: User[];
        pagination: { hasMore: boolean };
      }>(username, { page: page.toString(), limit: "20" });
      
      if (response.success && response.data) {
        const followingData = response.data.following || [];
        if (page === 1) {
          setFollowing(followingData);
        } else {
          setFollowing(prev => [...prev, ...followingData]);
        }
        setHasMoreFollowing(response.data.pagination?.hasMore || false);
        setFollowingPage(page);
      } else {
        setFollowing([]);
        setHasMoreFollowing(false);
      }
    } catch (error) {
      console.error("Failed to fetch following:", error);
      setFollowing([]);
      setHasMoreFollowing(false);
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
      const count = activeTab === "followers" ? followersCount : followingCount;
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No {activeTab === 'followers' ? GAMIFIED_TERMS.FOLLOWERS.toLowerCase() : 'connected users'} found.</p>
          {count > 0 && !searchQuery && (
            <p className="text-xs mt-2 text-gray-400">
              Data may be updating. Try refreshing the page.
            </p>
          )}
          {searchQuery && (
            <p className="text-xs mt-2 text-gray-400">
              Try adjusting your search terms
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2 flex-1">
              <UserLink username={user.username}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </UserLink>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <UserLink username={user.username}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                      {user.displayName}
                    </h3>
                  </UserLink>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    L{user.level}
                  </Badge>
                </div>
                <UserLink username={user.username}>
                  <p className="text-xs text-gray-600 hover:text-emerald-600 transition-colors">
                    @{user.username}
                  </p>
                </UserLink>
              </div>
            </div>
            
            {/* Show follow button only if not current user */}
            {currentUser && currentUser.username !== user.username ? (
              <div className="flex-shrink-0">
                <FollowButton
                  userId={user._id}
                  username={user.username}
                  isFollowing={userFollowStates[user._id] || false}
                  size="sm"
                  showIcon={false}
                  onFollowChange={(isFollowing, delta) => {
                    // Update the follow state when it changes
                    setUserFollowStates(prev => ({
                      ...prev,
                      [user._id]: isFollowing
                    }));
                  }}
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-16"></div>
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
      <DialogContent className="max-w-lg max-h-[700px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>@{username}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="followers">
                {GAMIFIED_TERMS.FOLLOWERS} ({followersCount})
              </TabsTrigger>
              <TabsTrigger value="following">
                {GAMIFIED_TERMS.FOLLOWING_LIST} ({followingCount})
              </TabsTrigger>
            </TabsList>
          
            {/* Search Bar */}
            <div className="relative mt-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={activeTab === 'followers' ? GAMIFIED_TERMS.SEARCH_CONNECTIONS : GAMIFIED_TERMS.SEARCH_CONNECTED}
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
          
            <TabsContent value="followers" className="flex-1 flex flex-col mt-4">
              <div className="flex-1 overflow-y-auto">
                {searchQuery ? (
                  renderUserList(filteredFollowers, false, false, () => {})
                ) : (
                  renderUserList(followers, loadingFollowers, hasMoreFollowers, loadMoreFollowers)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="following" className="flex-1 flex flex-col mt-4">
              <div className="flex-1 overflow-y-auto">
                {searchQuery ? (
                  renderUserList(filteredFollowing, false, false, () => {})
                ) : (
                  renderUserList(following, loadingFollowing, hasMoreFollowing, loadMoreFollowing)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
