// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/app-context"
import { apiClient } from "@/lib/api/api-client"
import { Post } from "@/types"
import { SmartAvatar } from "@/components/ui/smart-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2 } from "lucide-react"
import { PostSkeleton } from "@/components/skeletons/post-skeleton"
import { useToast } from "@/hooks/use-toast"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { AnimatePresence, motion } from "framer-motion"

// Only lazy load modals (loaded on demand)
import PostCard from '@/components/post-card'
import { HomeHero } from '@/components/home/hero'
// StatPills replaced by HomeHero for cleaner UI
// import StatPills from '@/components/stat-pills'

const SimplePostModal = dynamic(() => 
  import('@/components/modals/simple-post-modal').then(m => ({ default: m.SimplePostModal }))
)

const SearchModal = dynamic(() => 
  import('@/components/modals/search-modal').then(m => ({ default: m.SearchModal }))
)

export default function HomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    fetchPosts(1, true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fetchPosts = async (pageNum: number, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const response = await apiClient.getPosts({ 
        page: pageNum.toString(), 
        limit: "10"
      })
      
      if (response.success && response.data) {
        const newPosts = ((response.data as { posts?: Post[] }).posts || []) as Post[]
        setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
        setHasMore(newPosts.length === 10)
        setPage(pageNum)
      }
    } catch (error: unknown) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return
  if (observer.current) observer.current.disconnect()
  observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(page + 1)
      }
    })
  if (node) observer.current?.observe(node)
  }, [loading, loadingMore, hasMore, page])

  const handleCreatePost = async (postData: Record<string, unknown>) => {
    const tempId = `temp-${Date.now()}`
    const optimisticPost: Post = {
      id: tempId,
      _id: tempId,
      content: postData.content as string,
      author: user,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      viewsCount: 0,
      imageUrls: postData.imageUrls as string[] || [],
      videoUrls: postData.videoUrls as string[] || [],
      poll: postData.poll as any,
      linkPreview: postData.linkPreview as any,
      isOptimistic: true // Custom flag for UI if needed
    }

    // Add to top of feed immediately
    setPosts(prev => [optimisticPost, ...prev])
    toast({ title: "Posting...", description: "Your post is being published" })
    
    try {
      const response = await apiClient.createPost(postData)
      if (response.success && response.data) {
        const createdPost = ((response.data as { post?: Post }).post || response.data) as Post
        const normalized = {
          ...createdPost,
          id: createdPost.id || createdPost._id,
          author: createdPost.author || user,
          isLiked: false,
          viewsCount: 0,
          createdAt: createdPost.createdAt || new Date().toISOString()
        }
        
        // Replace optimistic post with real post
        setPosts(prev => prev.map(p => p.id === tempId ? normalized : p))
        toast({ title: "Posted!", description: "Your post has been published" })
      } else {
        throw new Error(response.message || "Failed to create post")
      }
    } catch (error) {
      // Remove optimistic post on failure
      setPosts(prev => prev.filter(p => p.id !== tempId))
      const message = error instanceof Error ? error.message : "Failed to create post"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await apiClient.deletePost(postId)
      if (response.success) {
        setPosts(prev => prev.filter(post => post.id !== postId))
        toast({ title: "Success", description: "Post deleted successfully!" })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete post"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await apiClient.togglePostLike(postId)
      if (response.success && response.data) {
        const data = response.data as { liked: boolean; likesCount: number }
        setPosts(prev => prev.map(post => {
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
    } catch (error: unknown) {
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" })
      throw error
    }
  }

  const handleCommentPost = (postId: string) => {
    // Comment functionality handled inline - no navigation needed
    console.log('Comment clicked for post:', postId)
  }

  const handlePostClick = (postId: string) => {
    window.location.href = `/post/${postId}`
  }

  return (
    <div className="w-full min-w-0 space-y-5 md:space-y-6 pb-20">
      <HeaderBar 
        onCreateClick={() => setShowPostModal(true)} 
        onSearchClick={() => setShowSearchModal(true)}
      />
      <HomeHero />
      <OfflineIndicator />
      
      {/* Search & Filter - Could go here */}
      
      <Compose onCreateClick={() => setShowPostModal(true)} />
      
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something!</p>
            <Button onClick={() => setShowPostModal(true)} className="rounded-full shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, index) => {
                const isLast = index === posts.length - 1
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    ref={isLast ? lastPostElementRef : null}
                    className="w-full min-w-0"
                  >
                    <PostCard
                      postId={post.id}
                      author={post.author?.displayName || post.author?.username || 'Unknown'}
                      handle={`@${post.author?.username || 'unknown'}`}
                      level={`L${post.author?.level || 1}`}
                      authorRole={post.author?.role}
                      xpDelta={post.xpAwarded}
                      content={post.content}
                      views={post.viewsCount}
                      liked={post.isLiked}
                      timestamp={post.createdAt}
                      avatar={post.author?.avatar || ''}
                      currentUserId={user?.id}
                      authorId={post.author?.id}
                      likesCount={post.likesCount}
                      commentsCount={post.commentsCount}
                      imageUrl={post.imageUrl}
                      imageUrls={post.imageUrls}
                      videoUrls={post.videoUrls}
                      poll={post.poll}
                      linkPreview={post.linkPreview}
                      onDelete={handleDeletePost}
                      onLike={handleLikePost}
                      onComment={handleCommentPost}
                      onClick={handlePostClick}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
        
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            You&apos;ve reached the end of the feed!
          </div>
        )}
      </div>
      
      <SimplePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
      />
      
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  )
}

function HeaderBar({ onCreateClick, onSearchClick }: { onCreateClick: () => void; onSearchClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
      <div className="grid gap-0.5 md:gap-1 flex-1 min-w-0">
        <h1 className="text-xl font-heading font-bold tracking-tight md:text-3xl truncate bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">DevSocial</h1>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearchClick}>
          <Search className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent relative border-muted-foreground/20 hover:bg-muted/10 rounded-full" onClick={onSearchClick}>
            <Search className="h-4 w-4" />
            <span className="text-muted-foreground">Search...</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded bg-muted/20 px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button onClick={onCreateClick} className="gap-2 rounded-full shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function Compose({ onCreateClick }: { onCreateClick: () => void }) {
  const { user } = useAuth()
  
  return (
    <Card className="glass-panel w-full min-w-0 transition-all hover:bg-white/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 min-w-0">
          <SmartAvatar
            src={user?.avatar}
            username={user?.username}
            alt={user?.displayName || user?.username}
            className="h-10 w-10 ring-2 ring-primary/20 flex-shrink-0"
            showLevelFrame={false}
            gender={(user as { gender?: 'male' | 'female' | 'other' })?.gender}
          />
          <div className="flex-1 min-w-0">
            <Input
              onClick={onCreateClick}
              readOnly
              aria-label="Compose a post"
              placeholder="What are you building today?"
              className="w-full h-12 rounded-full border-muted-foreground/10 bg-muted/20 px-5 text-base shadow-inner transition-all focus:bg-background focus:ring-2 focus:ring-primary/50 cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}