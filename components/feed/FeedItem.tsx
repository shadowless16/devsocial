// components/FeedItem.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share, MoreHorizontal, Zap, Copy, Trash, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { PostContent } from "@/components/shared/PostContent"
import { MentionText } from "@/components/ui/mention-text"
import { UserLink } from "@/components/shared/UserLink"
import { useViewTracker } from "@/hooks/use-view-tracker"
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

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  } | null; // Allow author to be null
  content: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrls?: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  xpAwarded: number;
  createdAt: string;
  isAnonymous: boolean;
  isLiked: boolean;
}

interface Comment {
  _id: string;
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
}

interface CommentsResponse {
  comments: Comment[];
}

interface CreateCommentResponse {
  comment: Comment;
}

interface ToggleLikeResponse {
  liked: boolean;
  likesCount: number;
}

interface FeedItemProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
  children?: React.ReactNode;
  onShowComments?: (show: boolean) => void;
}

export function FeedItem({ post, onLike, onComment, onDelete, onShowComments }: FeedItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  // Track views when post becomes visible
  useViewTracker(post.id);

  const handlePostClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't navigate if clicking on interactive elements
    if (
      target.closest('button, a, [role="button"], input, textarea, select') ||
      target.tagName.toLowerCase() === 'button' ||
      target.closest('.interactive-element') ||
      target.classList.contains('no-navigate')
    ) {
      return;
    }
    
    // Track view when post is clicked
    apiClient.trackPostView(post.id).catch(console.error);
    router.push(`/post/${post.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleCommentClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showComments) {
      await fetchComments();
    }
    setShowComments(!showComments);
    if (onShowComments) {
      onShowComments(!showComments);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await apiClient.getComments<CommentsResponse>(post.id);
      if (response.success && response.data) {
        setComments(response.data?.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCommentSubmit = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && commentContent.trim()) {
      e.preventDefault();
      await submitComment();
    }
  };

  const submitComment = async () => {
    if (!commentContent.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await apiClient.createComment<CreateCommentResponse>(post.id, commentContent.trim());
      if (response.success && response.data) {
        const newComment = response.data?.comment;
        if (newComment) {
          setComments([newComment, ...comments]);
          setCommentContent("");
          // Update post comment count if onComment callback is provided
          if (onComment) {
            onComment(post.id, commentContent.trim());
          }
        }
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!commentId || commentId === 'undefined') {
      console.error('Invalid comment ID:', commentId);
      return;
    }
    
    try {
      const response = await apiClient.toggleCommentLike<ToggleLikeResponse>(commentId);
      if (response.success && response.data) {
        setComments(
          comments.map((comment) =>
            (comment.id || comment._id) === commentId
              ? {
                  ...comment,
                  isLiked: response.data?.liked || false,
                  likesCount: response.data?.likesCount || 0,
                }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    }
  };

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
    if (!user || (!post.isAnonymous && post.author?.username !== user.username)) {
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
        if (onDelete) {
          onDelete(post.id);
        }
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const canDeletePost = user && (!post.isAnonymous ? post.author?.username === user.username : true);

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
      fullName: comment.author.displayName || comment.author.username,
      text: comment.content,
      replies: [], // Add nested replies support if needed
      timestamp: comment.createdAt,
    }));
  };

  const handleNewComment = async (data: any) => {
    try {
      setSubmittingComment(true);
      const response = await apiClient.createComment<CreateCommentResponse>(post.id, data.text);
      if (response.success && response.data) {
        const newComment = response.data?.comment;
        if (newComment) {
          setComments([newComment, ...comments]);
          if (onComment) {
            onComment(post.id, data.text);
          }
          toast({
            title: "Comment posted successfully!",
            variant: "success",
          });
        }
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full bg-white dark:bg-gray-950" onClick={handlePostClick} data-post-id={post.id}>
      <CardContent className="p-2">
        <div className="flex items-start space-x-2 mb-2">
          {post.isAnonymous ? (
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">?</AvatarFallback>
            </Avatar>
          ) : (
            <UserLink username={author.username}>
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={author.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                  {(author.displayName || author.username || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                </AvatarFallback>
              </Avatar>
            </UserLink>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-0.5">
              {post.isAnonymous ? (
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate">
                  Anonymous
                </h3>
              ) : (
                <UserLink username={author.username}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate">
                    {author.displayName}
                  </h3>
                </UserLink>
              )}
              {!post.isAnonymous && (
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0 px-1 py-0"
                >
                  L{author.level}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              {post.isAnonymous ? (
                <span className="truncate">Anonymous User</span>
              ) : (
                <UserLink username={author.username}>
                  <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate">
                    @{author.username}
                  </span>
                </UserLink>
              )}
              <span>•</span>
              <span className="truncate">{post.createdAt}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-1 py-0.5 rounded-full text-xs font-medium">
              <Zap className="w-2 h-2" />
              <span>+{post.xpAwarded}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 p-0"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32" align="end" onClick={(e) => e.stopPropagation()}>
                {canDeletePost && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost();
                    }} 
                    className="text-red-600 focus:text-red-600 text-xs"
                  >
                    <Trash className="w-3 h-3 mr-1" />
                    Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-xs text-gray-800 dark:text-gray-200">
            <PostContent content={post.content} onCopyCode={handleCopyCode} />
          </div>

          {/* Legacy single image support */}
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              {post.imageUrl.includes('video') || post.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  controls
                  className="w-full max-h-96 object-cover rounded-lg"
                  preload="metadata"
                >
                  <source src={post.imageUrl} type="video/mp4" />
                  <source src={post.imageUrl} type="video/webm" />
                  <source src={post.imageUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover max-h-96 rounded-lg"
                  unoptimized
                />
              )}
            </div>
          )}

          {/* Multiple images support */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mt-3 space-y-2">
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

          {/* Videos support */}
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

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer text-xs px-1 py-0"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 interactive-element">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 text-xs hover:bg-transparent p-1 ${
                post.isLiked
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-gray-500 dark:text-gray-400 hover:text-emerald-600"
              }`}
            >
              <Heart
                className={`w-3 h-3 ${post.isLiked ? "fill-current text-emerald-600" : ""}`}
              />
              <span>{post.likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentClick}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 text-xs hover:bg-transparent p-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{post.commentsCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-green-500 text-xs hover:bg-transparent p-1"
            >
              <Share className="w-3 h-3" />
            </Button>

            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
              <Eye className="w-3 h-3" />
              <span>{post.viewsCount || 0}</span>
            </div>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <Card key={comment.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <UserLink username={comment.author.username}>
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarImage src={comment.author.avatar || '/placeholder.svg'} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {(comment.author.displayName || comment.author.username || 'U')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                            </UserLink>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <UserLink username={comment.author.username}>
                                  <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                                    {comment.author.displayName || comment.author.username}
                                  </h4>
                                </UserLink>
                                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                                  L{comment.author.level}
                                </Badge>
                                <UserLink username={comment.author.username}>
                                  <span className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">@{comment.author.username}</span>
                                </UserLink>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{comment.createdAt}</span>
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Comment Input */}
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={user?.avatar || '/placeholder.svg'} />
                      <AvatarFallback>
                        {(user?.displayName || user?.username || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="min-h-[80px] resize-none border-gray-200"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {commentContent.length}/500 characters
                        </span>
                        <Button
                          onClick={submitComment}
                          disabled={!commentContent.trim() || submittingComment}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="sm"
                        >
                          {submittingComment ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}