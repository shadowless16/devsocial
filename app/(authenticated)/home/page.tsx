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
import { PostSkeleton } from "@/components/skeletons/post-skeleton"
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
      if (response.success && response.data) {
        const data = response.data as { liked: boolean; likesCount: number }
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: data.liked,
              likesCount: data.likesCount
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

  const handlePostClick = (postId: string) => {
    window.location.href = `/post/${postId}`
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 max-w-4xl">
      <HeaderBar onCreateClick={() => setShowPostModal(true)} />
      <StatPills />
      <Compose onCreateClick={() => setShowPostModal(true)} />
      <div className="grid gap-3 md:gap-4">
        {loading ? (
          <PostSkeleton />
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
              imageUrl={post.imageUrl}
              imageUrls={post.imageUrls}
              videoUrls={post.videoUrls}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              onComment={handleCommentPost}
              onClick={handlePostClick}
            />
          ))
        )}
      </div>
      
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}

function HeaderBar({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">DevSocial</h1>
        <p className="text-xs text-muted-foreground md:text-sm">{"What's happening in tech today?"}</p>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>
        <Button onClick={onCreateClick} className="gap-2 bg-emerald-600 hover:bg-emerald-600/90">
          <Plus className="h-4 w-4" />
          <span>Create</span>
        </Button>
      </div>
    </div>
  )
}

function Compose({ onCreateClick }: { onCreateClick: () => void }) {
  const { user } = useAuth()
  
  return (
    <Card className="group border-0 shadow-none ring-1 ring-black/5 transition-colors hover:bg-background mb-4">
      <CardContent className="flex items-start gap-3 p-3 md:p-4">
        <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-1 ring-emerald-100 flex-shrink-0">
          <AvatarImage 
            src={user?.avatar?.includes('models.readyplayer.me') && user.avatar.endsWith('.glb') 
              ? user.avatar.replace('.glb', '.png') 
              : user?.avatar || "/placeholder.svg"} 
            alt="Your avatar"
          />
          <AvatarFallback>
            {(user?.displayName || user?.username || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Input
            onClick={onCreateClick}
            readOnly
            aria-label="Compose a post"
            placeholder={"What's on your mind?"}
            className="h-10 md:h-11 w-full rounded-xl border-muted-foreground/20 bg-muted/40 px-3 md:px-4 text-sm shadow-none transition focus-visible:ring-emerald-500 cursor-pointer"
          />
          <div className="mt-2 md:mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-foreground">
                <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Add image</span>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-foreground">
                <Upload className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Upload file</span>
              </Button>
            </div>
            <Button onClick={onCreateClick} className="h-8 md:h-9 rounded-lg bg-emerald-600 px-3 md:px-4 text-sm hover:bg-emerald-600/90">Post</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}