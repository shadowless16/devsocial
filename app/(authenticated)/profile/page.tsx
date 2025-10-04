"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Edit2, Trophy, Target, Users, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'
import { useWebSocket } from '@/contexts/websocket-context'
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowStats } from '@/components/shared/FollowStats'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const EditProfileModal = dynamic(() => import('@/components/modals/edit-profile-modal'), {
  ssr: false
})

const SmartAvatar = dynamic(() => import('@/components/ui/smart-avatar').then(mod => ({ default: mod.SmartAvatar })), {
  ssr: false,
  loading: () => (
    <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
      <AvatarFallback className="text-xl">...</AvatarFallback>
    </Avatar>
  )
})

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth()
  const { socket } = useWebSocket()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('posts')
  const [profileData, setProfileData] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchProfileData = async () => {
      setIsLoading(true)
      try {
        const [profileRes, postsRes, statsRes] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/posts?limit=50'),
          fetch('/api/profile/stats')
        ])

        if (profileRes.ok) {
          const { data } = await profileRes.json()
          setProfileData({
            ...data.user,
            name: data.user?.displayName || data.user?.username || "User",
            joinDate: new Date(data.user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          })
        }

        if (postsRes.ok) {
          const response = await postsRes.json()
          
          if (response.success && response.data?.posts) {
            const userSpecificPosts = response.data.posts.filter((post: any) => {
              const authorId = post.author?.id || post.author?._id
              const userId = user.id || (user as any)._id
              return authorId === userId
            })
            setUserPosts(userSpecificPosts)
          }
        }

        if (statsRes.ok) {
          const { stats } = await statsRes.json()
          setUserStats(stats)
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user, authLoading])

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const tabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'media', label: 'Media', count: userPosts.filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length).length },
    { id: 'likes', label: 'Likes', count: userStats?.totalLikes || 0 }
  ]

  if (authLoading || isLoading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please log in to view your profile.
        </p>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Cover Photo Area */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        {/* Avatar and Edit Button */}
        <div className="flex justify-between items-start -mt-16 mb-4">
          <SmartAvatar 
            src={profileData?.avatar} 
            alt={profileData?.name || 'User'}
            fallback={profileData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            className="w-32 h-32 border-4 border-white shadow-xl"
            size={128}
          />
          <Button 
            variant="outline" 
            className="mt-16 bg-white hover:bg-gray-50"
            onClick={() => setShowEditModal(true)}
          >
            <Edit2 size={16} className="mr-2" />
            Edit profile
          </Button>
        </div>

        {/* Name and Bio */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {profileData?.name || user?.displayName || user?.username || 'User'}
          </h1>
          <p className="text-muted-foreground mb-3">
            @{profileData?.username || user?.username}
          </p>
          {profileData?.bio && (
            <p className="text-foreground mb-3 leading-relaxed">
              {profileData.bio}
            </p>
          )}
          
          {/* Location and Join Date */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
            {profileData?.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{profileData.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Joined {profileData?.joinDate || 'Recently'}</span>
            </div>
          </div>

          {/* Tech Stack */}
          {profileData?.techStack && profileData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.techStack.slice(0, 5).map((tech: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {profileData.techStack.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{profileData.techStack.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-4">
            {profileData?.userId && profileData?.username && (
              <FollowStats
                userId={profileData.userId}
                username={profileData.username}
                initialFollowersCount={profileData.followersCount || 0}
                initialFollowingCount={profileData.followingCount || 0}
                className="text-sm"
              />
            )}
            
            {/* XP and Level */}
            <div className="flex items-center gap-4">
              {profileData?.points && (
                <div className="flex items-center gap-1">
                  <Trophy size={16} className="text-yellow-500" />
                  <span className="font-semibold">{profileData.points}</span>
                  <span className="text-muted-foreground text-sm">XP</span>
                </div>
              )}
              {profileData?.level && (
                <Badge variant="default" className="bg-blue-500">
                  Level {profileData.level}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-1 text-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div 
                    key={post._id || post.id} 
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handlePostClick(post._id || post.id)}
                  >
                    <div className="flex items-start gap-3">
                      <SmartAvatar 
                        src={profileData?.avatar} 
                        alt={profileData?.name || 'User'}
                        fallback={profileData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        className="w-10 h-10"
                        size={40}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{profileData?.name || 'User'}</span>
                          <span className="text-muted-foreground text-sm">@{profileData?.username || 'user'}</span>
                          <span className="text-muted-foreground text-sm">·</span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground mb-3">{post.content}</p>
                        
                        {/* Media Preview */}
                        {(post.imageUrl || post.imageUrls?.length > 0) && (
                          <div className="mb-3">
                            <img 
                              src={post.imageUrl || post.imageUrls?.[0]} 
                              alt="Post media" 
                              className="w-full max-w-md h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy size={16} />
                            <span>{post.likesCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Start sharing your thoughts with the community!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              {userPosts.filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userPosts
                    .filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length)
                    .map((post) => (
                      <div 
                        key={post._id || post.id}
                        className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePostClick(post._id || post.id)}
                      >
                        <img 
                          src={post.imageUrl || post.imageUrls?.[0]} 
                          alt="Media post" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No media yet</h3>
                  <p className="text-muted-foreground">Photos and videos you share will appear here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No likes yet</h3>
              <p className="text-muted-foreground">Posts you like will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && profileData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profileData}
          onSave={(data) => {
            setProfileData((prev: any) => ({ ...prev, ...data }))
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}