// app/(authenticated)/post/[id]/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Send, Trash, Coins, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PostContent } from "@/components/shared/PostContent"
import { PostAIActions } from "@/components/shared/PostAIActions"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TipModal } from "@/components/modals/tip-modal"
import { getAvatarUrl } from "@/lib/avatar-utils"

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  } | null;
  content: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrls?: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  xpAwarded: number;
  createdAt: string;
  isAnonymous: boolean;
  isLiked: boolean;
  viewsCount: number;
}

interface Comment {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  content: string;
  likesCount: number;
  createdAt: string;
  isLiked: boolean;
  replies?: Comment[];
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showTipModal, setShowTipModal] = useState(false)

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getPost<{ post: any }>(postId)
        if (response.success && response.data) {
          const postData = response.data.post || response.data
          setPost({
            id: postData._id || postData.id,
            author: postData.author,
            content: postData.content,
            imageUrl: postData.imageUrl || null,
            imageUrls: postData.imageUrls || [],
            videoUrls: postData.videoUrls || [],
            tags: postData.tags || [],
            likesCount: postData.likesCount || postData.likes?.length || 0,
            commentsCount: postData.commentsCount || postData.comments?.length || 0,
            xpAwarded: postData.xpAwarded || 0,
            createdAt: postData.createdAt,
            isAnonymous: postData.isAnonymous || false,
            isLiked: postData.isLiked || false,
            viewsCount: postData.viewsCount || 0,
          })
        } else {
          setError("Post not found")
        }
      } catch (error: any) {
        setError(error.message || "Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true)
        const response = await apiClient.getComments<{ comments: any[] }>(postId)
        if (response.success && response.data) {
          setComments(response.data.comments.map((comment: any) => ({
            ...comment,
            id: comment._id,
            likesCount: comment.likesCount || comment.likes?.length || 0,
            replies: (comment.replies || []).map((reply: any) => ({
              ...reply,
              id: reply._id,
              likesCount: reply.likesCount || reply.likes?.length || 0
            }))
          })))
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error)
      } finally {
        setLoadingComments(false)
      }
    }

    if (postId && post) {
      fetchComments()
    }
  }, [postId, post])

  const handleLike = async () => {
    if (!post) return
    
    try {
      const response = await apiClient.togglePostLike<{ liked: boolean; likesCount: number }>(post.id)
      if (response.success && response.data) {
        const { liked, likesCount } = response.data
        setPost(prev => prev ? {
          ...prev,
          isLiked: liked,
          likesCount: likesCount,
        } : null)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !post) return

    setIsSubmitting(true)

    try {
      const response = await apiClient.createComment<{ comment: any }>(post.id, newComment.trim())
      if (response.success && response.data) {
        const newCommentData = response.data.comment
        setComments(prev => [...prev, {
          ...newCommentData,
          id: newCommentData._id,
          likesCount: 0,
          replies: []
        }])
        setNewComment("")
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null)
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentReply = async (parentCommentId: string, content: string) => {
    if (!post) return

    try {
      const response = await apiClient.createComment<{ comment: any }>(post.id, content, parentCommentId)
      if (response.success && response.data) {
        const commentsResponse = await apiClient.getComments<{ comments: any[] }>(post.id)
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data.comments.map((comment: any) => ({
            ...comment,
            id: comment._id,
            likesCount: comment.likesCount || comment.likes?.length || 0,
            replies: (comment.replies || []).map((reply: any) => ({
              ...reply,
              id: reply._id,
              likesCount: reply.likesCount || reply.likes?.length || 0
            }))
          })))
        }
      }
    } catch (error) {
      console.error("Failed to submit reply:", error)
      toast({
        title: "Failed to submit reply",
        variant: "destructive",
      })
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await apiClient.toggleCommentLike<{ liked: boolean; likesCount: number }>(commentId)
      if (response.success && response.data) {
        const { liked, likesCount } = response.data
        setComments(prev =>
          prev.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: liked,
                likesCount: likesCount,
              }
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        isLiked: liked,
                        likesCount: likesCount,
                      }
                    : reply
                ),
              }
            }
            return comment
          }),
        )
      }
    } catch (error) {
      console.error("Failed to toggle comment like:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US') + " " + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleDeletePost = async () => {
    if (!user || (!post?.isAnonymous && post?.author?.username !== user.username)) {
      toast({
        title: "You can only delete your own posts",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.deletePost(post.id)
      if (response.success) {
        toast({
          title: "Post deleted successfully",
          variant: "success",
        })
        router.push('/')
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full py-4 lg:py-6 px-2 sm:px-4">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading post...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="w-full py-4 lg:py-6 px-2 sm:px-4">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error || "Post not found"}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fallbackAuthor = {
    username: "Unknown",
    displayName: "Unknown User",
    avatar: "/placeholder.svg",
    level: 1,
  }

  const author = post.isAnonymous ? fallbackAuthor : (post.author || fallbackAuthor)

  return (
    <div className="w-full min-w-0 max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Back Button */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Button>
      </div>

      {/* Post */}
      <Card className="w-full min-w-0 border-0 ring-1 ring-black/5">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0 ring-1 ring-primary/20">
              <AvatarImage src={getAvatarUrl(author.avatar)} />
              <AvatarFallback>
                {post.isAnonymous
                  ? "?"
                  : (author.displayName || author.username || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between min-w-0">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {post.isAnonymous ? "Anonymous" : author.displayName}
                    </h3>
                    {!post.isAnonymous && (
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 flex-shrink-0">
                        L{author.level}
                      </Badge>
                    )}
                    {post.isAnonymous && (
                      <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 flex-shrink-0">
                        Anonymous
                      </Badge>
                    )}
                    <Badge className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0 h-5 flex-shrink-0">
                      +{post.xpAwarded} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="truncate">
                      {post.isAnonymous
                        ? "Anonymous User"
                        : `@${author.username}`}
                    </span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">{formatTimestamp(post.createdAt)}</span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user && (!post.isAnonymous ? post.author?.username === user.username : true) && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePost()
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <div className="text-sm leading-relaxed break-words">
                <PostContent content={post.content} onCopyCode={() => {}} />
              </div>
              
              {/* Media Content */}
              {(post.imageUrls?.length || post.videoUrls?.length) && (
                <div className="rounded-lg overflow-hidden">
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className={`grid gap-2 ${
                      post.imageUrls.length === 1 ? 'grid-cols-1' :
                      post.imageUrls.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {post.imageUrls.map((imageUrl, index) => (
                        <img 
                          key={index}
                          src={imageUrl}
                          alt={`Post image ${index + 1}`} 
                          className="w-full h-auto object-cover rounded-md max-h-48"
                        />
                      ))}
                    </div>
                  )}
                  
                  {post.videoUrls && post.videoUrls.length > 0 && (
                    <div className="space-y-2">
                      {post.videoUrls.map((videoUrl, index) => (
                        <video 
                          key={index}
                          controls 
                          className="w-full h-auto max-h-96 rounded-lg"
                          preload="metadata"
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* AI Actions */}
              <PostAIActions 
                postContent={post.content} 
                postId={post.id}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-red-500 ${
                    post.isLiked ? "text-red-500" : ""
                  }`}
                >
                  <Heart className={`h-4 w-4 transition ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </Button>
                
                <div className="flex items-center gap-2 h-9 px-3 rounded-full text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-green-500"
                >
                  <Share className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Share</span>
                </Button>
              </div>
              
              {!post.isAnonymous && post.author && user && post.author.username !== user.username && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-yellow-600 border border-yellow-200 hover:border-yellow-300"
                  onClick={() => setShowTipModal(true)}
                >
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">Tip</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>Views: {post.viewsCount || 0}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(post.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h3>
        {loadingComments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading comments...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={getAvatarUrl(comment.author.avatar)} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {(comment.author.displayName || comment.author.username || "U")
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {comment.author.displayName}
                        </h4>
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                          L{comment.author.level}
                        </Badge>
                        <span className="text-sm text-gray-500">@{comment.author.username}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{formatTimestamp(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 mb-3 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 text-sm h-8 px-3 rounded-full ${
                              comment.isLiked
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likesCount}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center space-x-1 text-sm h-8 px-3 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Reply</span>
                          </Button>
                        </div>
                      </div>
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="min-h-[80px] resize-none border-gray-200"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (replyText.trim()) {
                                  await handleCommentReply(comment.id, replyText)
                                  setReplyingTo(null)
                                  setReplyText("")
                                }
                              }}
                              disabled={!replyText.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Comment Input */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={getAvatarUrl(user?.avatar)} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {(user?.displayName || "U")
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <form onSubmit={handleCommentSubmit}>
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none border-gray-200 mb-3"
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500 characters
                    </span>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!post.isAnonymous && post.author && user && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientId={post.author.username}
          recipientName={post.author.displayName || post.author.username}
          recipientAvatar={post.author.avatar}
          currentUserId={user.username}
          currentUserBalance={user.demoWalletBalance || 0}
          onTipSent={() => {
            toast({
              title: "Tip sent!",
              description: `Successfully tipped ${post.author?.displayName || post.author?.username}`,
            })
          }}
        />
      )}
    </div>
  )
}