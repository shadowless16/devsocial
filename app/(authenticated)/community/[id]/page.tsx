"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Users, MessageSquare, Plus } from "lucide-react"
import { useAuth } from "@/contexts/app-context"
import { SimplePostModal } from "@/components/modals/simple-post-modal"
import { FeedItem } from "@/components/feed/FeedItem"

export default function CommunityPage() {
  const params = useParams()
  const router = useRouter()
  const communityId = params.id as string
  const { user } = useAuth()
  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)

  useEffect(() => {
    if (communityId) {
      fetchCommunity()
      fetchPosts()
    }
  }, [communityId])

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}`)
      const data = await response.json()
      if (data.success) {
        setCommunity(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch community:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`)
      const data = await response.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const handleJoinToggle = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setCommunity((prev: any) => ({
          ...prev,
          memberCount: data.data.memberCount,
          members: data.data.isJoined 
            ? [...prev.members, user?.id]
            : prev.members.filter((id: string) => id !== user?.id)
        }))
      }
    } catch (error) {
      console.error('Failed to join/leave community:', error)
    }
  }

  // Check if user is creator or member
  const isCreator = user && community?.creator && (community.creator._id === user.id || community.creator === user.id)
  const isMember = user && community?.members?.some((member: any) => 
    member._id === user.id || member === user.id || member.toString() === user.id
  )
  const canPost = isCreator || isMember

  const handleCreatePost = async (postData: any) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      const data = await response.json()
      if (data.success) {
        setPosts(prev => [data.data, ...prev])
        setShowPostModal(false)
        // Update community post count
        setCommunity((prev: any) => ({
          ...prev,
          postCount: (prev.postCount || 0) + 1
        }))
      } else {
        console.error('Failed to create post:', data.message)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Community not found</h1>
          <Button onClick={() => router.push("/communities")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
        </div>
      </div>
    )
  }

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/communities")}
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl sm:text-2xl flex-shrink-0">
              {community.name?.[0]?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 truncate">{community.name}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {community.category}
                  </Badge>
                </div>

                {isCreator ? (
                  <Badge variant="default" className="w-full sm:w-auto justify-center bg-yellow-500 text-white">
                    <span className="hidden sm:inline">Community Creator</span>
                    <span className="sm:hidden">Creator</span>
                  </Badge>
                ) : (
                  <Button
                    onClick={handleJoinToggle}
                    variant={isMember ? "destructive" : "default"}
                    className={`w-full sm:w-auto ${
                      isMember
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {isMember ? "Leave Community" : "Join Community"}
                    </span>
                    <span className="sm:hidden">
                      {isMember ? "Leave" : "Join"}
                    </span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{formatCount(community.memberCount)} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{formatCount(community.postCount)} posts</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{community.longDescription || community.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Create Post */}
            {canPost ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user.displayName?.[0] || user.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      className="flex-1 justify-start text-muted-foreground bg-transparent"
                      onClick={() => setShowPostModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Share something with the community...
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      {isCreator ? "Welcome to your community! Start posting to engage with members." : "Join this community to start posting and engaging with other members!"}
                    </p>
                    {!isCreator && (
                      <Button 
                        onClick={handleJoinToggle}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Join Community
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <FeedItem
                  key={post._id}
                  post={post}
                  onLike={async () => {
                    try {
                      const response = await fetch(`/api/likes/posts/${post._id}`, {
                        method: 'POST'
                      })
                      if (response.ok) {
                        const data = await response.json()
                        setPosts(prev => prev.map(p => 
                          p._id === post._id 
                            ? { ...p, likesCount: data.data.likesCount, isLiked: data.data.isLiked }
                            : p
                        ))
                      }
                    } catch (error) {
                      console.error('Failed to like post:', error)
                    }
                  }}
                  onComment={() => {}}
                  onDelete={async (postId) => {
                    if (user?.id === post.author._id || user?.role === 'admin') {
                      try {
                        const response = await fetch(`/api/posts/${postId}`, {
                          method: 'DELETE'
                        })
                        if (response.ok) {
                          setPosts(prev => prev.filter(p => p._id !== postId))
                          setCommunity((prev: any) => ({
                            ...prev,
                            postCount: Math.max(0, (prev.postCount || 0) - 1)
                          }))
                        }
                      } catch (error) {
                        console.error('Failed to delete post:', error)
                      }
                    }
                  }}
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Community Rules */}
            <Card className="bg-card border-border">
              <CardHeader>
                <h3 className="font-semibold text-card-foreground">Community Rules</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {community.rules.map((rule: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary font-semibold">{index + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card className="bg-card border-border">
              <CardHeader>
                <h3 className="font-semibold text-card-foreground">Recent Members</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community.members?.slice(0, 4).map((member: any, index: number) => (
                    <div key={member._id || index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {member.displayName?.[0] || member.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-card-foreground">
                        {member.displayName || member.username}
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No members yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <SimplePostModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          onSubmit={handleCreatePost}
        />
      </div>
    </div>
  )
}