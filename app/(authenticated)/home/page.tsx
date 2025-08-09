"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Image, Upload } from "lucide-react"
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
  viewsCount: number
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
      const response = await apiClient.getPosts<{ posts: Post[] }>({ limit: "20" });
      
      if (response.success && response.data && response.data.posts) {
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
                  isLiked: response.data!.liked,
                  likesCount: response.data!.likesCount,
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
          id: (responsePost as any).id || (responsePost as any)._id?.toString() || '',
          author: (responsePost as any).author || {
            username: user?.username || 'Unknown',
            displayName: user?.displayName || 'Unknown User',
            avatar: user?.avatar ?? '/placeholder.svg',
            level: user?.level || 1,
          },
          content: responsePost.content || '',
          tags: responsePost.tags || [],
          isAnonymous: responsePost.isAnonymous || false,
          imageUrl: responsePost.imageUrl || null,
          likesCount: responsePost.likesCount || 0,
          commentsCount: responsePost.commentsCount || 0,
          viewsCount: (responsePost as any).viewsCount || 0,
          xpAwarded: responsePost.xpAwarded || 0,
          isLiked: false,
          createdAt: (responsePost as any).createdAt || new Date().toISOString(),
        }
        
        setPosts(prevPosts => [newPost, ...prevPosts])
        setShowPostModal(false);
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
    <div className="w-full max-w-lg mx-auto py-2 px-2">
      {/* Header */}
      <div className="mb-3">
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">TechConnect</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">What's happening in tech today?</p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search"
              className="pl-7 pr-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
            />
          </div>
          <Button
            onClick={() => setShowPostModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3 py-1.5 font-medium text-xs"
          >
            Create
          </Button>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {challenges.map((challenge, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-gray-950">
            <CardContent className="p-2">
              <div className="flex items-center mb-1">
                <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${
                  challenge.color === "emerald"
                    ? "bg-emerald-100 dark:bg-emerald-900/20"
                    : challenge.color === "orange"
                      ? "bg-orange-100 dark:bg-orange-900/20"
                      : "bg-purple-100 dark:bg-purple-900/20"
                }`}>
                  <span className="text-xs">
                    {challenge.color === "emerald" ? "🏆" : challenge.color === "orange" ? "💡" : "👍"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-xs ${
                    challenge.color === "emerald"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : challenge.color === "orange"
                        ? "text-orange-700 dark:text-orange-400"
                        : "text-purple-700 dark:text-purple-400"
                  }`}>
                    {challenge.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-1 line-clamp-2">
                {challenge.description}
              </p>
              <div className="flex items-center justify-between">
                {challenge.xp > 0 && (
                  <div className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                    challenge.color === "emerald"
                      ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                  }`}>
                    +{challenge.xp} XP
                  </div>
                )}
                {challenge.featured && (
                  <div className="inline-flex items-center px-1 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Creation Prompt */}
      <Card className="mb-2 border-0 shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-2">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6 border border-gray-100 dark:border-gray-700">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs">
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-full px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              onClick={() => setShowPostModal(true)}
            >
              <p className="text-gray-500 dark:text-gray-400 text-xs">What's on your mind?</p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-2">
        {posts.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-950">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <FeedItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handlePostDelete}
            />
          ))
        )}
      </div>

      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostCreate}
      />
    </div>
  )
}
