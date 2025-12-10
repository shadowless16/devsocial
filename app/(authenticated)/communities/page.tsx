"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/app-context";

interface Community {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  members: string[];
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities');
      const data = await response.json();
      if (data.success) {
        setCommunities(data.data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter((community) => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinCommunity = async (communityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setCommunities(prev => prev.map((community) => 
          community._id === communityId 
            ? { 
                ...community, 
                memberCount: data.data.memberCount,
                members: data.data.isJoined 
                  ? [...(community.members || []), user?.id || '']
                  : (community.members || []).filter((m) => 
                      user && (m !== user.id && m !== user.id.toString())
                    )
              }
            : community
        ));
      }
    } catch (error: unknown) {
      console.error('Failed to join/leave community:', error);
    }
  };

  const handleCardClick = (communityId: string) => {
    router.push(`/community/${communityId}`);
  };

  const { user } = useAuth();

  if (loading) {
    return (
      <div className="w-full mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-muted-foreground">Join communities and connect with like-minded developers</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => router.push("/create-community")}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Community</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.map((community) => (
          <Card 
            key={community.id} 
            className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => handleCardClick(community._id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{community.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {community.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {community.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{community.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{community.postCount} posts</span>
                </div>
              </div>
              
              <Button
                onClick={(e) => handleJoinCommunity(community._id, e)}
                variant={user && community.members?.some((member) => 
                  member === user.id || member === user.id.toString()
                ) ? "outline" : "default"}
                size="sm"
                className="w-full text-sm"
              >
                {user && community.members?.some((member) => 
                  member === user.id || member === user.id.toString()
                ) ? "Leave" : "Join"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}