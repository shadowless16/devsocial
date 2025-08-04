"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedItem } from "@/components/feed/FeedItem"
import { PostModal } from "@/components/modals/post-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface Post {
  id: string
  author: {
    username: string
    displayName: string
    avatar: string
    level: number
  }
  content: string
  imageUrl?: string | null
  tags: string[]
  likesCount: number
  commentsCount: number
  xpAwarded: number
  createdAt: string
  isAnonymous: boolean
  isLiked: boolean
}

const challenges = [
  {
    title: "Weekly Challenge",
    description: "Build a REST API with error handling",
    xp: 100,
    color: "emerald",
  },
  {
    title: "Today's Prompt",
    description: "Share your biggest coding mistake",
    xp: 50,
    color: "orange",
  },
  {
    title: "Top Response",
    description: "Always backup before major refactors",
    xp: 0,
    color: "purple",
    featured: true,
  },
]

export default function FeedPage() {
  const [showPostModal, setShowPostModal] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPosts<{ posts: Post[] }>({ limit: "20" })
      if (response.success && response.data) {
        setPosts(response.data.posts as Post[])
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await apiClient.togglePostLike<{ liked: boolean; likesCount: number }>(postId)
      if (response.success && response.data) {
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: response.data.liked,
                  likesCount: response.data.likesCount,
                }
              : post,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    // Update comment count in posts list
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          : post,
      ),
    )
  }

  const handlePostCreate = async (postData: any) => {
    try {
      const response = await apiClient.createPost<{ post: Post }>(postData)
      if (response.success && response.data) {
        const responsePost = response.data.post;
        const newPost: Post = {
          id: (responsePost as any).id || (responsePost as any)._id || '',
          author: (responsePost as any).author || {
            username: user?.username || 'Unknown',
            displayName: user?.displayName || 'Unknown User',
            avatar: user?.avatar || '/placeholder.svg',
            level: user?.level || 1,
          },
          content: (responsePost as any).content || '',
          tags: (responsePost as any).tags || [],
          isAnonymous: (responsePost as any).isAnonymous || false,
          imageUrl: (responsePost as any).imageUrl || null,
          likesCount: (responsePost as any).likesCount || 0,
          commentsCount: (responsePost as any).commentsCount || 0,
          xpAwarded: (responsePost as any).xpAwarded || 0,
          isLiked: false,
          createdAt: (responsePost as any).createdAt || new Date().toISOString(),
        }
        setPosts([newPost, ...posts])
        setShowPostModal(false)
      }
    } catch (error: any) {
      console.error("Failed to create post:", error)
    }
  }

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-4 lg:py-6 px-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-4 lg:py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchPosts} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full lg:max-w-2xl lg:mx-auto py-2 sm:py-4 lg:py-6 px-3 sm:px-4">
      {/* Header - Hidden on mobile since it's in the layout header */}
      <div className="hidden lg:block mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">TechConnect</h1>
            <p className="text-gray-600">What's happening in tech today?</p>
          </div>
          <Button
            onClick={() => setShowPostModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Create Post Button */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setShowPostModal(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Challenges Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {challenges.map((challenge, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                  challenge.color === "emerald"
                    ? "bg-emerald-100 text-emerald-800"
                    : challenge.color === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-purple-100 text-purple-800"
                }`}
              >
                {challenge.featured ? "🔥" : "⚡"} <span className="truncate">{challenge.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">{challenge.description}</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {challenge.xp > 0 && (
                  <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    +{challenge.xp} XP
                  </div>
                )}
                {challenge.featured && (
                  <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Creation Prompt - Desktop only */}
      <Card className="mb-6 hidden lg:block">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowPostModal(true)}
              className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              What's on your mind, {user?.username}?
            </button>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                ✨ Code Snippet
              </Button>
              {/* <Button variant="ghost" size="sm" className="text-orange-600">
                🎯 Challenge
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4 lg:space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <FeedItem 
              key={post.id} 
              post={post} 
              onLike={() => handleLike(post.id)}
              onComment={handleComment}
              onDelete={handlePostDelete}
            />
          ))
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <PostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} onSubmit={handlePostCreate} />
      )}
    </div>
  )
}
