// app/(authenticated)/profile/[username]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit, MapPin, Calendar, Link as LinkIcon, Trophy, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { FeedItem } from "@/components/feed/FeedItem";
import { FollowButton } from "@/components/shared/FollowButton";
import { FollowListModal } from "@/components/shared/FollowListModal";

// --- START: FINALIZED INTERFACES ---
interface Post {
  _id: string;
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  content: string;
  imageUrl?: string | null;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  xpAwarded: number;
  createdAt: string;
  isAnonymous: boolean;
  isLiked: boolean;
}

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  bio: string;
  affiliation: string;
  avatar: string;
  bannerUrl: string;
  level: number;
  points: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  location?: string;
  website?: string;
  createdAt: string;
  rank?: number;
  rankTitle?: string;
  recentPosts: Post[];
  stats: { totalPosts: number; };
}
interface ProfileResponse { user: UserProfile; }
// --- END: FINALIZED INTERFACES ---


export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFollowList, setShowFollowList] = useState(false);

  useEffect(() => {
    console.log('[Profile] Effect triggered:', { username, authLoading });
    if (!username || authLoading) return;

    const fetchProfileData = async () => {
      console.log('[Profile] Fetching profile data for:', username);
      setLoading(true);
      setError(null);
      try {
        const profileRes = await apiClient.getUserProfileByUsername<ProfileResponse>(username);
        console.log('[Profile] Profile response:', profileRes);
        if (profileRes.success && profileRes.data?.user) {
          setProfile(profileRes.data.user);
        } else {
          throw new Error(profileRes.message || "User not found");
        }
      } catch (err: any) {
        console.error('[Profile] Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [username, authLoading]);

  // --- START: THE GUARD CLAUSE FIX ---
  // This block runs BEFORE the main JSX. If any of these conditions are true,
  // it returns a loading/error message and stops, preventing the "possibly 'null'" errors.
  if (loading || authLoading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }
  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }
  if (!profile) {
    // This is the most important guard. If we get past this, TypeScript knows 'profile' is not null.
    return <div className="text-center py-20">User not found.</div>;
  }
  // --- END: THE GUARD CLAUSE FIX ---


  // --- From here on, TypeScript knows 'profile' is a valid UserProfile object ---
  const isOwnProfile = currentUser?.username.toLowerCase() === profile.username.toLowerCase();
  const displayName = profile.displayName || profile.username;
  const xpToNext = (profile.level * 1000) - profile.points;
  const progressPercentage = (profile.points / (profile.level * 1000)) * 100;
  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <div className="relative">
        <div 
          className="h-32 md:h-48 bg-gray-200 rounded-t-lg bg-cover bg-center"
          style={{ backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'none' }}
        />
        <Card className="p-4 sm:p-6 pt-16 sm:pt-6">
          <div className="relative flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
            <div className="absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:-mt-16">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar} alt={`${displayName}'s avatar`} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-full text-center sm:text-left mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                {isOwnProfile && (
                  <div className="mt-4 sm:mt-0">
                    <Button variant="outline" onClick={() => router.push('/settings')}>
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-4 text-gray-700 max-w-xl mx-auto sm:mx-0">{profile.bio || "This user hasn't written a bio yet."}</p>
              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-500">
                  <span className="flex items-center"><Calendar size={14} className="mr-1.5" />Joined {joinedDate}</span>
                  {profile.location && <span className="flex items-center"><MapPin size={14} className="mr-1.5" />{profile.location}</span>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-emerald-600 hover:underline"><LinkIcon size={14} className="mr-1.5" />Website</a>}
              </div>
              <div className="flex justify-center sm:justify-start space-x-6 mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center"><p className="font-bold text-lg">{profile.stats.totalPosts}</p><p className="text-sm text-gray-500">Posts</p></div>
                  <div className="text-center cursor-pointer hover:opacity-75 transition-opacity" onClick={() => setShowFollowList(true)}>
                    <p className="font-bold text-lg">{profile.followersCount ?? 0}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-75 transition-opacity" onClick={() => setShowFollowList(true)}>
                    <p className="font-bold text-lg">{profile.followingCount ?? 0}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {!isOwnProfile && (
        <div className="flex justify-center mt-4">
          <FollowButton
            userId={profile._id}
            username={profile.username}
            isFollowing={profile.isFollowing}
            onFollowChange={(following, change) => {
              setProfile(prev => ({
                ...prev,
                followersCount: (prev?.followersCount || 0) + change
              }));
            }}
          />
        </div>
      )}

      <FollowListModal
        isOpen={showFollowList}
        onClose={() => setShowFollowList(false)}
        username={profile.username}
        followersCount={profile.followersCount ?? 0}
        followingCount={profile.followingCount ?? 0}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-2"><Star className="w-5 h-5 text-yellow-500 mr-2" /><span className="text-lg font-bold">Level {profile.level}</span></div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>{(profile.points ?? 0).toLocaleString()} Points</span><span>{xpToNext.toLocaleString()} to next</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-2"><Trophy className="w-5 h-5 text-purple-500 mr-2" /><span className="text-lg font-bold">#{profile.rank ?? 'N/A'}</span></div>
            <p className="text-sm text-gray-600">Global Rank</p>
            <p className="text-xs text-purple-600 font-medium">{profile.rankTitle ?? 'Unranked'}</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center mb-2"><Users className="w-5 h-5 text-blue-500 mr-2" /><span className="text-lg font-bold">{profile.affiliation}</span></div>
            <p className="text-sm text-gray-600">Affiliation</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4 mt-6">
          {profile.recentPosts.length > 0 ? (
            profile.recentPosts.map((post) => (
              <FeedItem key={post._id} post={{...post, id: post._id}} onLike={() => {}} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">This user has no posts yet.</div>
          )}
        </TabsContent>
        <TabsContent value="badges" className="mt-6"><div className="text-center py-10 text-gray-500">Badge display coming soon.</div></TabsContent>
        <TabsContent value="activity" className="mt-6"><div className="text-center py-10 text-gray-500">Activity feed coming soon.</div></TabsContent>
      </Tabs>
    </div>
  );
}