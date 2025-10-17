"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Calendar, Edit2, Trophy, Target, Users, MessageCircle, Loader2, Heart, FolderOpen, ListOrdered, Plus, BarChart3 } from 'lucide-react'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers')
  const [followData, setFollowData] = useState<any[]>([])
  const [loadingFollowData, setLoadingFollowData] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (authLoading || !user) return
    fetchInitialData()
  }, [user, authLoading])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/users/profile'),
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

      if (statsRes.ok) {
        const { stats } = await statsRes.json()
        setUserStats(stats)
      }

      // Fetch initial posts
      await fetchUserPosts(1, true)
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPosts = async (pageNum: number, reset = false) => {
    try {
      if (!reset) {
        setLoadingMore(true)
      }
      
      const response = await fetch(`/api/posts?limit=50&page=${pageNum}`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data?.posts) {
          const userSpecificPosts = result.data.posts.filter((post: any) => {
            const authorId = post.author?.id || post.author?._id
            const userId = user?.id || (user as any)?._id
            return authorId === userId
          })
          
          if (reset) {
            setUserPosts(userSpecificPosts)
          } else {
            setUserPosts(prev => [...prev, ...userSpecificPosts])
          }
          
          setHasMore(result.data.posts.length === 50)
          setPage(pageNum)
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchUserPosts(page + 1)
      }
    })
    if (node) observer.current?.observe(node)
  }, [isLoading, loadingMore, hasMore, page])

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleShowFollowModal = async (type: 'followers' | 'following') => {
    setFollowModalType(type)
    setShowFollowModal(true)
    setLoadingFollowData(true)
    
    try {
      const endpoint = type === 'followers' 
        ? `/api/users/${profileData?.username}/followers`
        : `/api/users/${profileData?.username}/following`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const list = type === 'followers' ? result.data.followers : result.data.following
          setFollowData(list || [])
        }
      }
    } catch (error) {
      console.error('Error fetching follow data:', error)
    } finally {
      setLoadingFollowData(false)
    }
  }

  const tabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length, icon: MessageCircle },
    { id: 'media', label: 'Media', count: userPosts.filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length).length, icon: Target },
    { id: 'projects', label: 'Projects', count: 0, icon: FolderOpen },
    { id: 'missions', label: 'Missions', count: 3, icon: ListOrdered },
    { id: 'referrals', label: 'Referrals', count: 0, icon: Plus },
    { id: 'stats', label: 'Stats', count: 0, icon: BarChart3 }
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
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {profileData?.bannerUrl && (
          <img 
            src={profileData.bannerUrl} 
            alt="Profile banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Info */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Avatar and Edit Button */}
        <div className="flex justify-between items-start -mt-12 sm:-mt-16 mb-3 sm:mb-4">
          <SmartAvatar 
            src={profileData?.avatar} 
            alt={profileData?.name || 'User'}
            fallback={profileData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-white shadow-xl"
            size={128}
          />
          <Button 
            variant="outline" 
            size="sm"
            className="mt-12 sm:mt-16 bg-white hover:bg-gray-50 text-xs sm:text-sm"
            onClick={() => setShowEditModal(true)}
          >
            <Edit2 size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Edit profile</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>

        {/* Name and Bio */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-words">
            {profileData?.name || user?.displayName || user?.username || 'User'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3">
            @{profileData?.username || user?.username}
          </p>
          {profileData?.bio && (
            <p className="text-sm sm:text-base text-foreground mb-2 sm:mb-3 leading-relaxed break-words">
              {profileData.bio}
            </p>
          )}
          
          {/* Location and Join Date */}
          <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 flex-wrap">
            {profileData?.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{profileData.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Joined {profileData?.joinDate || 'Recently'}</span>
            </div>
          </div>

          {/* Tech Stack */}
          {profileData?.techStack && profileData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {profileData.techStack.slice(0, 5).map((tech: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5">
                  {tech}
                </Badge>
              ))}
              {profileData.techStack.length > 5 && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                  +{profileData.techStack.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-4 flex-wrap">
            {/* Following/Followers */}
            <button className="hover:underline" onClick={() => handleShowFollowModal('following')}>
              <span className="font-semibold text-sm sm:text-base">{profileData?.followingCount || 0}</span>
              <span className="text-muted-foreground text-xs sm:text-sm ml-1">Following</span>
            </button>
            <button className="hover:underline" onClick={() => handleShowFollowModal('followers')}>
              <span className="font-semibold text-sm sm:text-base">{profileData?.followersCount || 0}</span>
              <span className="text-muted-foreground text-xs sm:text-sm ml-1">Followers</span>
            </button>
            
            {/* XP and Level */}
            {profileData?.points && (
              <div className="flex items-center gap-1">
                <Trophy size={14} className="sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">{profileData.points}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">XP</span>
              </div>
            )}
            {profileData?.level && (
              <Badge variant="default" className="bg-blue-500 text-xs sm:text-sm px-2 py-0.5">
                Level {profileData.level}
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border -mx-3 sm:-mx-4">
          <div className="overflow-x-auto scrollbar-hide px-3 sm:px-4">
            <nav className="flex gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-4 whitespace-nowrap font-medium text-xs transition-all min-w-[80px] ${
                    activeTab === tab.id
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={18} className="flex-shrink-0" />
                  <span className="text-[11px] leading-tight">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {userPosts.length > 0 ? (
                <>
                  {userPosts.map((post, index) => {
                    const isLast = index === userPosts.length - 1
                    return (
                      <div 
                        key={post._id || post.id} 
                        ref={isLast ? lastPostElementRef : null}
                        className="border border-border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handlePostClick(post._id || post.id)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <SmartAvatar 
                            src={profileData?.avatar} 
                            alt={profileData?.name || 'User'}
                            fallback={profileData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                            size={40}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                              <span className="font-semibold text-sm sm:text-base truncate">{profileData?.name || 'User'}</span>
                              <span className="text-muted-foreground text-xs sm:text-sm truncate">@{profileData?.username || 'user'}</span>
                              <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">·</span>
                              <span className="text-muted-foreground text-xs sm:text-sm">
                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-foreground text-sm sm:text-base mb-2 sm:mb-3 break-words">{post.content}</p>
                            
                            {/* Media Preview */}
                            {(post.imageUrl || post.imageUrls?.length > 0 || post.videoUrls?.length > 0) && (() => {
                              const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video')
                              const mediaUrl = post.videoUrls?.[0] || post.imageUrl || post.imageUrls?.[0]
                              const isVideoMedia = mediaUrl && isVideo(mediaUrl)
                              
                              return (
                                <div className="mb-2 sm:mb-3 -mx-3 sm:mx-0">
                                  {isVideoMedia ? (
                                    <video 
                                      controls
                                      src={mediaUrl}
                                      className="w-full h-auto object-contain rounded-none sm:rounded-lg max-h-[400px]"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img 
                                      src={mediaUrl} 
                                      alt="Post media" 
                                      className="w-full h-auto object-contain rounded-none sm:rounded-lg"
                                    />
                                  )}
                                </div>
                              )
                            })()}
                            
                            <div className="flex items-center gap-4 sm:gap-6 text-muted-foreground text-xs sm:text-sm">
                              <div className="flex items-center gap-1">
                                <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                                <span>{post.commentsCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart size={14} className="sm:w-4 sm:h-4" />
                                <span>{post.likesCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  
                  {!hasMore && userPosts.length > 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      You've reached the end of your posts!
                    </div>
                  )}
                </>
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
            <div className="space-y-3">
              {userPosts.filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {userPosts
                    .filter(p => p.imageUrl || p.imageUrls?.length || p.videoUrls?.length)
                    .map((post) => {
                      const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video')
                      const mediaUrl = post.videoUrls?.[0] || post.imageUrl || post.imageUrls?.[0]
                      const isVideoMedia = mediaUrl && isVideo(mediaUrl)
                      
                      return (
                        <div 
                          key={post._id || post.id}
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handlePostClick(post._id || post.id)}
                        >
                          {isVideoMedia ? (
                            <video 
                              src={mediaUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <img 
                              src={mediaUrl} 
                              alt="Media post" 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )
                    })
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

          {activeTab === 'projects' && (
            <div className="space-y-3">
              <div className="text-center py-8 sm:py-12 px-4">
                <FolderOpen size={40} className="sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">Your coding projects and repositories will appear here.</p>
                <Button className="mt-3 sm:mt-4" size="sm" onClick={() => router.push('/projects')}>
                  <Plus size={16} className="mr-2" />
                  Add Project
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className="border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <ListOrdered size={16} className="sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base truncate">Daily Coding Challenge</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">In Progress</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Complete 3 coding posts this week</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">2/3</span>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <Trophy size={16} className="sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base truncate">Community Engagement</h3>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">Completed</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Like and comment on 10 posts</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs text-green-600">10/10</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => router.push('/missions')}>
                  View All Missions
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <Plus size={40} className="sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Invite Friends</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">Share DevSocial with friends and earn rewards!</p>
                </div>
                
                <div className="bg-muted rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Your Referral Code</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Share this code with friends</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <code className="bg-background px-2 py-1 rounded text-xs sm:text-sm">{user?.username?.toUpperCase() || 'USER123'}</code>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">0 XP</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Earned</div>
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => router.push('/referrals')}>
                  Manage Referrals
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="border border-border rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-500">{userPosts.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Posts</div>
                </div>
                <div className="border border-border rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-500">{userStats?.totalLikes || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Likes</div>
                </div>
                <div className="border border-border rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-500">{profileData?.points || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">XP Points</div>
                </div>
                <div className="border border-border rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-500">{profileData?.level || 1}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Level</div>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="truncate">Posted a new update</span>
                    <span className="text-muted-foreground ml-auto whitespace-nowrap text-[10px] sm:text-xs">2h ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="truncate">Completed a mission</span>
                    <span className="text-muted-foreground ml-auto whitespace-nowrap text-[10px] sm:text-xs">1d ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="truncate">Gained 50 XP</span>
                    <span className="text-muted-foreground ml-auto whitespace-nowrap text-[10px] sm:text-xs">2d ago</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => router.push('/leaderboard')}>
                View Global Leaderboard
              </Button>
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
            setProfileData((prev: any) => ({ 
              ...prev, 
              ...data,
              name: data.displayName || prev.name,
              avatar: data.avatar || prev.avatar,
              bannerUrl: data.bannerUrl || prev.bannerUrl
            }))
            setShowEditModal(false)
          }}
        />
      )}

      {/* Follow Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {followModalType === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFollowModal(false)}>
                <Edit2 size={16} className="rotate-45" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {loadingFollowData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : followData.length > 0 ? (
                <div className="space-y-3">
                  {followData.map((person: any) => (
                    <div key={person._id || person.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.displayName?.[0] || person.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{person.displayName || person.username}</p>
                        <p className="text-sm text-muted-foreground truncate">@{person.username}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${person.username}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {followModalType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}