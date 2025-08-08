// app/(authenticated)/post/[id]/page.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Zap, Send, Trash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CommentItem } from "@/components/feed/comment-item"
import { PostContent } from "@/components/shared/PostContent"
import Image from "next/image"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import dynamic from 'next/dynamic'

// Dynamically import CommentSection to avoid SSR issues
const CommentSection = dynamic(
  () => import('react-comments-section').then((mod) => ({ default: mod.CommentSection })),
  { 
    ssr: false,
    loading: () => <div className="text-center py-4">Loading comments...</div>
  }
)

// Mock post data
const mockPost = {
  id: "1",
  author: {
    username: "alexchen",
    displayName: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    level: 12,
  },
  content:
    "Just shipped my first TypeScript project! 🎉 The type safety is incredible. Anyone else making the switch from JavaScript? I've been working on this for weeks and the developer experience is so much better. Here are some key benefits I've noticed:\n\n1. Better IDE support with autocomplete\n2. Catch errors at compile time\n3. Easier refactoring\n4. Better documentation through types\n\nWhat's your experience been like?",
  imageUrl: "/placeholder.svg?height=300&width=500",
  tags: ["#typescript", "#javascript", "#webdev"],
  likesCount: 124,
  commentsCount: 18,
  xpAwarded: 25,
  createdAt: "2 hours ago",
  isAnonymous: false,
  isLiked: false,
}

const mockComments = [
  {
    id: "1",
    author: {
      username: "sarahcode",
      displayName: "Sarah Code",
      avatar: "/placeholder.svg?height=32&width=32",
      level: 18,
    },
    content: "Totally agree! The type safety has saved me so many debugging hours. Welcome to the TypeScript club! 🎉",
    likesCount: 12,
    createdAt: "1 hour ago",
    isLiked: true,
    replies: [
      {
        id: "1-1",
        author: {
          username: "alexchen",
          displayName: "Alex Chen",
          avatar: "/placeholder.svg?height=32&width=32",
          level: 12,
        },
        content: "Thanks Sarah! Any tips for someone just starting out?",
        likesCount: 3,
        createdAt: "45 minutes ago",
        isLiked: false,
      },
    ],
  },
  {
    id: "2",
    author: {
      username: "devmike",
      displayName: "Dev Mike",
      avatar: "/placeholder.svg?height=32&width=32",
      level: 15,
    },
    content: "I made the switch last year and never looked back. The learning curve is worth it!",
    likesCount: 8,
    createdAt: "30 minutes ago",
    isLiked: false,
    replies: [],
  },
]

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
          })));
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
        // Add new comment at the end (newest last)
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
    if (!post) return;

    try {
      const response = await apiClient.createComment<{ comment: any }>(post.id, content, parentCommentId);
      if (response.success && response.data) {
        // Refresh comments to show the new reply
        const commentsResponse = await apiClient.getComments<{ comments: any[] }>(post.id);
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
          })));
        }
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
      toast({
        title: "Failed to submit reply",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await apiClient.toggleCommentLike<{ liked: boolean; likesCount: number }>(commentId)
      if (response.success && response.data) {
        const { liked, likesCount } = response.data
        setComments(prev =>
          prev.map(comment => {
            // Check if it's the main comment
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: liked,
                likesCount: likesCount,
              }
            }
            // Check if it's a reply within this comment
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

  const handleCopyCode = (codeContent: string) => {
    navigator.clipboard.writeText(codeContent).then(() => {
      toast({
        title: "Copied to clipboard!",
        variant: "success",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const handleDeletePost = async () => {
    if (!user || (!post?.isAnonymous && post?.author?.username !== user.username)) {
      toast({
        title: "You can only delete your own posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.deletePost(post.id);
      if (response.success) {
        toast({
          title: "Post deleted successfully",
          variant: "success",
        });
        router.push('/');
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-full sm:max-w-2xl mx-auto py-4 lg:py-6 px-2 sm:px-4">
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
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-full sm:max-w-2xl mx-auto py-4 lg:py-6 px-2 sm:px-4">
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
    );
  }

  // Fallback author data for invalid or missing author
  const fallbackAuthor = {
    username: "Unknown",
    displayName: "Unknown User",
    avatar: "/placeholder.svg",
    level: 1,
  };

  const author = post.isAnonymous ? fallbackAuthor : (post.author || fallbackAuthor);

  // Transform comments data for react-comments-section
  const formatCommentsForReactSection = (comments: Comment[]) => {
    return comments.map((comment) => ({
      userId: comment.author.username,
      comId: comment.id,
      avatarUrl: comment.author.avatar || '/placeholder.svg',
      userProfile: comment.author.username,
      fullName: comment.author.displayName,
      text: comment.content,
      replies: [], // Add nested replies support if needed
      timestamp: comment.createdAt,
    }));
  };

  const handleNewComment = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.createComment<{ comment: any }>(post!.id, data.text);
      if (response.success && response.data) {
        const newCommentData = response.data.comment;
        setComments(prev => [...prev, {
          ...newCommentData,
          id: newCommentData._id,
          likesCount: 0,
          replies: []
        }]);
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
        toast({
          title: "Comment posted successfully!",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full sm:max-w-2xl mx-auto py-4 lg:py-6 px-2 sm:px-4">
      {/* Back Button */}
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Button>
      </div>

      {/* Post */}
      <Card className="mb-6">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 lg:w-12 lg:h-12">
                <AvatarImage src={author.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {post.isAnonymous
                    ? "?"
                    : ((author.displayName || author.username || "A") || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 text-base lg:text-lg">
                    {post.isAnonymous ? "Anonymous" : author.displayName}
                  </h3>
                  {!post.isAnonymous && (
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                      L{author.level}
                    </Badge>
                  )}
                  {post.isAnonymous && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      Anonymous
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>
                    {post.isAnonymous
                      ? "Anonymous User"
                      : `@${author.username}`}
                  </span>
                  <span>•</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                <Zap className="w-3 h-3" />
                <span>+{post.xpAwarded} XP</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  {user && (!post.isAnonymous ? post.author?.username === user.username : true) && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost();
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
          </div>

          {/* Content */}
          <div className="mb-4">
            <PostContent content={post.content} onCopyCode={handleCopyCode} />

{/* Multiple Images */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="mt-4 space-y-2">
                {post.imageUrls.length === 1 ? (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={post.imageUrls[0]}
                      alt="Post image"
                      width={500}
                      height={300}
                      className="w-full h-auto object-cover max-h-96"
                    />
                  </div>
                ) : (
                  <div className={`grid gap-2 rounded-lg overflow-hidden ${
                    post.imageUrls.length === 2 ? 'grid-cols-2' :
                    post.imageUrls.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.imageUrls.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className={`relative ${
                          post.imageUrls!.length === 3 && index === 0 ? 'row-span-2' : ''
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Post image ${index + 1}`}
                          width={250}
                          height={200}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {post.videoUrls && post.videoUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                {post.videoUrls.map((videoUrl, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <video 
                      controls
                      className="w-full max-h-96 object-cover"
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      <source src={videoUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  post.isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likesCount}</span>
              </Button>

              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentsCount}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments with React Comments Section */}
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
                      <AvatarImage src={comment.author.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {(comment.author.displayName || "U")
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
                        <span className="text-sm text-gray-500">{comment.createdAt}</span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Reply input box */}
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
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (replyText.trim()) {
                                  await handleCommentReply(comment.id, replyText);
                                  setReplyingTo(null);
                                  setReplyText("");
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
                      {/* Render nested replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="pl-12 border-l-2 border-gray-100">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarImage src={reply.author.avatar || '/placeholder.svg'} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                    {(reply.author.displayName || "U")
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-semibold text-gray-900 text-sm">
                                      {reply.author.displayName}
                                    </h5>
                                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                                      L{reply.author.level}
                                    </Badge>
                                    <span className="text-xs text-gray-500">@{reply.author.username}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{reply.createdAt}</span>
                                  </div>
                                  <p className="text-gray-800 text-sm mb-2 leading-relaxed">{reply.content}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
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
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                        className="flex items-center space-x-1 text-xs h-7 px-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        <span>Reply</span>
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    >
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  {/* Reply input box for nested comments */}
                                  {replyingTo === reply.id && (
                                    <div className="mt-3 space-y-2">
                                      <Textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="min-h-[60px] resize-none border-gray-200 text-sm"
                                        rows={2}
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setReplyingTo(null);
                                            setReplyText("");
                                          }}
                                          className="text-xs"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={async () => {
                                            if (replyText.trim()) {
                                              await handleCommentReply(comment.id, replyText);
                                              setReplyingTo(null);
                                              setReplyText("");
                                            }
                                          }}
                                          disabled={!replyText.trim()}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                        >
                                          <Send className="w-3 h-3 mr-1" />
                                          Reply
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
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
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.avatar || '/placeholder.svg'} />
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
    </div>
  )
}
