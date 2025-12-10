"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FeedItem } from "./FeedItem"
import { CommentItem } from "./comment-item"
import { apiClient } from "@/lib/api/api-client" 

interface Post {
  id: string
  [key: string]: unknown
}

interface FeedComment {
  id: string
  author: {
    username: string
    displayName: string
    avatar: string
    level: number
  }
  content: string
  likesCount: number
  createdAt: string
  isLiked: boolean
  replies?: FeedComment[]
}

interface FeedProps {
  initialPosts?: Post[]
}

export function Feed({ initialPosts = [] }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({})
  const observer = useRef<IntersectionObserver | null>(null)
  
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const [page, setPage] = useState(1)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPosts<{ posts: Post[]; hasMore: boolean }>({ page: page.toString() })
      if (response && response.data) {
        setPosts(prev => [...prev, ...response.data.posts])
        setHasMore(response.data.hasMore)
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Failed to fetch posts:", errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    if (page > 1) {
      fetchPosts()
    }
  }, [page, fetchPosts])

  const handleLike = async () => {
    // Implementation needed based on existing code context
  }

  const handleComment = () => {
    // Implementation needed based on existing code context
  }

  const handleDelete = (postId: string) => {
    setPosts(posts.filter(p => String(p.id) !== postId))
  }

  const fetchComments = async (postId: string) => {
    try {
       const res = await apiClient.getComments<{ comments: FeedComment[] }>(postId);
       if(res.success && res.data) {
         setCommentsByPost(prev => ({...prev, [postId]: res.data?.comments || []}))
       }
    } catch(error) {
       console.error("Failed to fetch comments", error)
    }
  }

  const handleCommentLike = async (commentId: string, postId: string) => {
    try {
      await apiClient.toggleLike('comment', commentId);
      await fetchComments(postId);
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Failed to like comment:", errorMessage);
    }
  };

  const handleShowComments = (postId: string, show: boolean) => {
    if (show && !commentsByPost[postId]) {
      fetchComments(postId);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        const postId = String(post.id);
        return (
          <div key={postId} ref={isLast ? lastPostElementRef : null}>
            <FeedItem
              post={post as Post & { author: { username: string; displayName: string; avatar: string; level: number } | null; content: string; tags: string[]; likesCount: number; commentsCount: number; viewsCount: number; xpAwarded: number; createdAt: string; isAnonymous: boolean; isLiked: boolean }}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
              onShowComments={(show: boolean) => handleShowComments(postId, show)}
            >
              {commentsByPost[postId]?.map((comment) => (
                <CommentItem
                  key={String(comment.id)}
                  comment={comment}
                  replies={comment.replies || []}
                  onLike={() => handleCommentLike(String(comment.id), postId)}
                />
              ))}
            </FeedItem>
          </div>
        );
      })}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          You&apos;ve reached the end of the feed!
        </div>
      )}
    </div>
  );
}
