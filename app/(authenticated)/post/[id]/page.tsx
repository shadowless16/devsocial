// app/(authenticated)/post/[id]/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Send, Trash, Coins, Eye, Bookmark, Flag } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PostContent } from "@/components/shared/PostContent"
import { PostAIActions } from "@/components/shared/PostAIActions"
import { EnhancedCommentInput } from "@/components/ui/enhanced-comment-input"
import { UserLink } from "@/components/shared/UserLink"
import { MentionText } from "@/components/ui/mention-text"
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
import { PollDisplay } from "@/components/poll/poll-display"

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
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      voters: string[];
    }>;
    settings: {
      multipleChoice: boolean;
      maxChoices: number;
      showResults: "always" | "afterVote" | "afterEnd";
      allowAddOptions: boolean;
    };
    endsAt?: string;
    totalVotes: number;
  };
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
  const [isBookmarked, setIsBookmarked] = useState(false)

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
            poll: postData.poll || undefined,
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
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null)
        toast({
          title: "Reply posted!",
        })
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
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
    <div className="w-full min-w-0 max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-4 space-y-3">
      {/* Back Button */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Button>
      </div>

      {/* Post */}
      <Card className="w-full min-w-0 border-0 ring-1 ring-black/5">
        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 min-w-0">
            {post.isAnonymous ? (
              <UserAvatar 
                user={author}
                className="w-10 h-10 flex-shrink-0 ring-1 ring-primary/20"
              />
            ) : (
              <UserLink username={author.username}>
                <UserAvatar 
                  user={author}
                  className="w-10 h-10 flex-shrink-0 ring-1 ring-primary/20"
                />
              </UserLink>
            )}
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between min-w-0">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {post.isAnonymous ? (
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        Anonymous
                      </h3>
                    ) : (
                      <UserLink username={author.username}>
                        <h3 className="font-semibold text-gray-900 text-base truncate hover:text-emerald-600 transition-colors">
                          {author.displayName}
                        </h3>
                      </UserLink>
                    )}
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
                    {post.isAnonymous ? (
                      <span className="truncate">Anonymous User</span>
                    ) : (
                      <UserLink username={author.username}>
                        <span className="truncate hover:text-emerald-600 transition-colors">
                          @{author.username}
                        </span>
                      </UserLink>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user && (!post.isAnonymous ? post.author?.username === user.username : true) ? (
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
                    ) : (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          toast({ title: "Report submitted", description: "Thank you for helping keep our community safe" })
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Poll Display */}
              {post.poll && (
                <div className="mb-4">
                  <PollDisplay
                    poll={post.poll}
                    userVotes={post.poll.options.filter(opt => opt.voters.includes(user?.id || '')).map(opt => opt.id)}
                    onVote={async (optionIds) => {
                      try {
                        const response = await apiClient.request<any>('/polls/vote', {
                          method: 'POST',
                          body: JSON.stringify({ postId: post.id, optionIds }),
                        })
                        if (response.success && response.data) {
                          setPost(prev => prev ? { ...prev, poll: response.data.poll } : null)
                          toast({
                            title: "Vote recorded!",
                            description: `+${response.data.xpAwarded} XP`,
                          })
                        }
                      } catch (error: any) {
                        toast({
                          title: "Failed to vote",
                          description: error.message,
                          variant: "destructive",
                        })
                      }
                    }}
                    currentUserId={user?.id}
                  />
                </div>
              )}

              {/* Content */}
              <div className="text-sm leading-relaxed break-words">
                <PostContent content={post.content} onCopyCode={() => {}} />
              </div>
              
              {/* Media Content */}
              {(() => {
                const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video')
                const imageUrl = post.imageUrl
                const imageUrls = post.imageUrls || []
                const videoUrls = post.videoUrls || []
                const allMedia = [...(imageUrl ? [imageUrl] : []), ...imageUrls]
                const images = allMedia.filter(url => !isVideo(url))
                const videos = [...allMedia.filter(url => isVideo(url)), ...videoUrls]
                
                if (images.length === 0 && videos.length === 0) return null
                
                return (
                  <div className="rounded-lg overflow-hidden border border-border">
                    {images.length > 0 && (
                      <div className={`grid gap-2 ${
                        images.length === 1 ? 'grid-cols-1' :
                        images.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {images.map((url, index) => (
                          <img 
                            key={index}
                            src={url}
                            alt={`Post image ${index + 1}`} 
                            className="w-full h-auto object-contain rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    
                    {videos.length > 0 && (
                      <div className="space-y-2">
                        {videos.map((url, index) => (
                          <video 
                            key={index}
                            controls 
                            className="w-full h-auto max-h-[500px] rounded-lg"
                            preload="metadata"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <source src={url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
                    <Badge
                      key={`${tag}-${idx}`}
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                    >
                      #{tag.replace(/^#+/, '')}
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
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-blue-500 ${
                  isBookmarked ? "text-blue-500" : ""
                }`}
              >
                <Bookmark className={`h-4 w-4 transition ${isBookmarked ? "fill-blue-500" : ""}`} />
              </Button>
              
              {!post.isAnonymous && post.author && user && post.author.username !== user.username && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-full px-3 ml-auto border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50"
                  onClick={() => setShowTipModal(true)}
                >
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Tip</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{post.viewsCount || 0} views</span>
              </div>
              <time className="text-xs text-muted-foreground" title={formatFullTimestamp(post.createdAt)}>
                {formatTimestamp(post.createdAt)}
              </time>
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
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <UserLink username={comment.author.username}>
                      <UserAvatar 
                        user={comment.author}
                        className="w-10 h-10 flex-shrink-0"
                      />
                    </UserLink>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserLink username={comment.author.username}>
                          <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                            {comment.author.displayName}
                          </h4>
                        </UserLink>
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                          L{comment.author.level}
                        </Badge>
                        <UserLink username={comment.author.username}>
                          <span className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">@{comment.author.username}</span>
                        </UserLink>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{formatTimestamp(comment.createdAt)}</span>
                      </div>
                      <div className="text-gray-800 mb-3 leading-relaxed">
                        <MentionText text={comment.content} />
                      </div>
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
                        <div className="mt-3">
                          <EnhancedCommentInput
                            placeholder={`Reply to @${comment.author.username}...`}
                            onSubmit={async (content) => {
                              await handleCommentReply(comment.id, content)
                              setReplyingTo(null)
                            }}
                          />
                        </div>
                      )}
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-8 space-y-3 border-l-2 border-gray-200 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-3">
                              <UserLink username={reply.author.username}>
                                <UserAvatar 
                                  user={reply.author}
                                  className="w-8 h-8 flex-shrink-0"
                                />
                              </UserLink>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <UserLink username={reply.author.username}>
                                    <h4 className="font-semibold text-gray-900 text-sm hover:text-emerald-600 transition-colors">
                                      {reply.author.displayName}
                                    </h4>
                                  </UserLink>
                                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                                    L{reply.author.level}
                                  </Badge>
                                  <UserLink username={reply.author.username}>
                                    <span className="text-xs text-gray-500 hover:text-emerald-600 transition-colors">@{reply.author.username}</span>
                                  </UserLink>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(reply.createdAt)}</span>
                                </div>
                                <div className="text-gray-800 text-sm mb-2 leading-relaxed">
                                  <MentionText text={reply.content} />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCommentLike(reply.id)}
                                  className={`flex items-center space-x-1 text-xs h-7 px-2 rounded-full ${
                                    reply.isLiked
                                      ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                                      : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likesCount}</span>
                                </Button>
                              </div>
                            </div>
                          ))}
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
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              {user && (
                <UserAvatar 
                  user={{
                    username: user.username || '',
                    avatar: user.avatar,
                    displayName: user.displayName
                  }}
                  className="w-10 h-10 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <EnhancedCommentInput
                  placeholder="Write a comment..."
                  onSubmit={async (content, imageUrl) => {
                    setIsSubmitting(true)
                    try {
                      const response = await apiClient.createComment<{ comment: any }>(post.id, content, undefined, imageUrl)
                      if (response.success && response.data) {
                        const newCommentData = response.data.comment
                        setComments(prev => [...prev, {
                          ...newCommentData,
                          id: newCommentData._id,
                          likesCount: 0,
                          replies: []
                        }])
                        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null)
                      }
                    } catch (error) {
                      console.error("Failed to submit comment:", error)
                      toast({
                        title: "Failed to post comment",
                        variant: "destructive",
                      })
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                />
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