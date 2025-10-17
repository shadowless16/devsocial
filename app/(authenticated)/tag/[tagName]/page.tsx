"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Hash } from "lucide-react"
import PostCard from "@/components/post-card"

interface Post {
  id: string
  content: string
  author: {
    username: string
    displayName: string
    avatar: string
  }
  tags: string[]
  imageUrl?: string
  createdAt: string
  likesCount: number
  commentsCount: number
  viewsCount: number
}

export default function TagPage() {
  const params = useParams()
  const tagName = params.tagName as string
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [tagStats, setTagStats] = useState({ totalPosts: 0, totalEngagement: 0 })

  useEffect(() => {
    if (tagName) {
      fetchTagPosts()
    }
  }, [tagName])

  const fetchTagPosts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<{ posts: Post[], pagination: any }>(`/tags/search?tag=${encodeURIComponent(tagName)}`)
      
      if (response.success && response.data) {
        const posts = response.data.posts || []
        setPosts(posts)
        setTagStats({ 
          totalPosts: response.data.pagination?.total || 0, 
          totalEngagement: posts.reduce((sum: number, post: Post) => sum + post.likesCount + post.commentsCount, 0) 
        })
      }
    } catch (error) {
      console.error("Failed to fetch tag posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tag Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Hash className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">#{tagName}</CardTitle>
              <p className="text-muted-foreground">
                {tagStats.totalPosts} posts • {tagStats.totalEngagement} total engagements
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                No posts have been tagged with #{tagName} yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id}
              postId={post.id}
              author={post.author.displayName}
              handle={`@${post.author.username}`}
              avatar={post.author.avatar}
              content={post.content}
              timestamp={post.createdAt}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              views={post.viewsCount}
              imageUrl={post.imageUrl}
              imageUrls={[]}
              videoUrls={[]}
              authorId={post.author.username}
              onClick={(postId) => window.location.href = `/post/${postId}`}
            />
          ))
        )}
      </div>
    </div>
  )
}