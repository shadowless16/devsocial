"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageIcon, Plus, Search, Upload, Loader2 } from "lucide-react"
import PostCard from "@/components/post-card"
import StatPills from "@/components/stat-pills"
import { PostModal } from "@/components/modals/post-modal"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPosts()
      if (response.success && response.data) {
        setPosts((response.data as any).posts || [])
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (postData: any) => {
    try {
      const response = await apiClient.createPost(postData)
      if (response.success) {
        toast({ title: "Success", description: "Post created successfully!" })
        setShowPostModal(false)
        fetchPosts()
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await apiClient.deletePost(postId)
      if (response.success) {
        setPosts(posts.filter(post => post.id !== postId))
        toast({ title: "Success", description: "Post deleted successfully!" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete post", variant: "destructive" })
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await apiClient.togglePostLike(postId)
      if (response.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const wasLiked = post.isLiked
            return {
              ...post,
              isLiked: !wasLiked,
              likesCount: wasLiked ? post.likesCount - 1 : post.likesCount + 1
            }
          }
          return post
        }))
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" })
      throw error
    }
  }

  const handleCommentPost = (postId: string) => {
    window.location.href = `/post/${postId}`
  }

  return (
    <>
      <HeaderBar onCreateClick={() => setShowPostModal(true)} />
      <StatPills />
      <Compose onCreateClick={() => setShowPostModal(true)} />
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something!</p>
            <Button onClick={() => setShowPostModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              author={post.author?.displayName || post.author?.username}
              handle={`@${post.author?.username}`}
              level={`L${post.author?.level || 1}`}
              xpDelta={post.xpAwarded}
              content={post.content}
              views={post.viewsCount}
              liked={post.isLiked}
              timestamp={post.createdAt}
              avatar={post.author?.avatar}
              currentUserId={user?.id}
              authorId={post.author?.id}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              onComment={handleCommentPost}
            />
          ))
        )}
      </div>
      
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
      />
    </>
  )
}

function HeaderBar({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">TechConnect</h1>
        <p className="text-sm text-muted-foreground">{"What's happening in tech today?"}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        <Button onClick={onCreateClick} className="gap-2 bg-emerald-600 hover:bg-emerald-600/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>
    </div>
  )
}

function Compose({ onCreateClick }: { onCreateClick: () => void }) {
  const { user } = useAuth()
  
  return (
    <Card className="group border-0 shadow-none ring-1 ring-black/5 transition-colors hover:bg-background">
      <CardContent className="flex items-start gap-3 p-4 md:p-6">
        <Avatar className="h-9 w-9 ring-1 ring-emerald-100">
          <AvatarImage src={user?.avatar || "/generic-user-avatar.png"} alt="Your avatar" />
          <AvatarFallback>{user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input
            onClick={onCreateClick}
            readOnly
            aria-label="Compose a post"
            placeholder={"What's on your mind?"}
            className="h-11 w-full rounded-xl border-muted-foreground/20 bg-muted/40 px-4 text-sm shadow-none transition focus-visible:ring-emerald-500 cursor-pointer"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <Upload className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={onCreateClick} className="h-9 rounded-lg bg-emerald-600 px-4 text-sm hover:bg-emerald-600/90">Post</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}