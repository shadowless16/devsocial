// components/FeedItem.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share, MoreHorizontal, Zap, Copy, Trash, Eye, Coins } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/app-context"
import { PostContent } from "@/components/shared/PostContent"
import { MentionText } from "@/components/ui/mention-text"
import { UserLink } from "@/components/shared/UserLink"
import { EnhancedCommentInput } from "@/components/ui/enhanced-comment-input"
import { useViewTracker } from "@/hooks/use-view-tracker"
import { PostMeta } from "@/components/shared/PostMeta"
import { PostAIActions } from "@/components/shared/PostAIActions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import dynamic from 'next/dynamic'
import { TipModal } from "@/components/modals/tip-modal"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { formatTimeAgo } from "@/lib/time-utils"
import { PollDisplay } from "@/components/poll/poll-display"
import { LinkPreviewCard } from "@/components/ui/link-preview-card"

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
    role?: string;
    gender?: 'male' | 'female' | 'other';
  } | null;
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
  imprintStatus?: "none" | "pending" | "submitted" | "confirmed" | "failed" | "duplicate";
  onChainProof?: {
    txId?: string;
    topicId?: string;
    seq?: number;
  } | null;
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
  linkPreview?: {
    title: string;
    description: string;
    image?: string;
    url: string;
    siteName: string;
  };
}

interface Comment {
  _id: string;
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
    gender?: 'male' | 'female' | 'other';
  };
  content: string;
  imageUrl?: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [pollData, setPollData] = useState(post.poll);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  // Track views when post becomes visible
  const viewTrackerRef = useViewTracker(post.id) as React.RefObject<HTMLDivElement>;

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

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${author.displayName}`,
          text: post.content?.substring(0, 100) + (post.content && post.content.length > 100 ? '...' : ''),
          url: postUrl
        })
      } else {
        await navigator.clipboard.writeText(postUrl)
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        })
      }
    } catch (error) {
      console.log('Share cancelled or failed')
    }
  };



  const submitComment = async (content: string, imageUrl?: string) => {
    if (!content.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await apiClient.createComment<CreateCommentResponse>(post.id, content.trim(), undefined, imageUrl);
      if (response.success && response.data) {
        const newComment = response.data?.comment;
        if (newComment) {
          const formattedComment = {
            ...newComment,
            id: newComment._id || newComment.id,
            _id: newComment._id || newComment.id,
            likesCount: 0,
            isLiked: false
          };
          setComments([formattedComment, ...comments]);
          // Update post comment count if onComment callback is provided
          if (onComment) {
            onComment(post.id, content.trim());
          }
          toast({
            title: "Comment posted!",
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

  const handlePollVote = async (optionIds: string[]) => {
    try {
      const response = await apiClient.request<any>('/polls/vote', {
        method: 'POST',
        body: JSON.stringify({ postId: post.id, optionIds }),
      });
      
      if (response.success && response.data) {
        setPollData(response.data.poll);
        toast({
          title: "Vote recorded!",
          description: `+${response.data.xpAwarded} XP`,
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserVotes = () => {
    if (!user || !pollData) return [];
    return pollData.options
      .filter((opt) => opt.voters.includes(user.id as string))
      .map((opt) => opt.id);
  };

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
    <TooltipProvider>
      <Card 
        ref={viewTrackerRef}
        className="border-0 shadow-none ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[1px] w-full overflow-hidden" 
        data-post-id={post.id}
      >
        <div className="flex flex-row items-start gap-2 md:gap-3 space-y-0 p-3 md:p-6 overflow-hidden">
        {post.isAnonymous ? (
          <UserAvatar 
            user={{ username: 'anonymous', avatar: '', displayName: 'Anonymous' }}
            className="h-9 w-9 ring-1 ring-emerald-100"
          />
        ) : (
          <UserLink username={author.username}>
            <UserAvatar 
              user={author}
              className="h-9 w-9 ring-1 ring-emerald-100"
            />
          </UserLink>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 text-sm">
            <div className="flex items-center gap-2">
              {post.isAnonymous ? (
                <div className="font-medium">Anonymous</div>
              ) : (
                <UserLink username={author.username}>
                  <div className="font-medium hover:text-emerald-600 transition-colors truncate">
                    {author.displayName}
                  </div>
                </UserLink>
              )}
              {!post.isAnonymous && (
                <>
                  <Badge className="rounded-full bg-emerald-50 px-2 py-0 text-[10px] font-semibold leading-5 text-emerald-700 hover:bg-emerald-50 flex-shrink-0">
                    L{author.level}
                  </Badge>
                  {post.author?.role === 'admin' && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0 leading-5 flex-shrink-0 font-semibold">
                      🛡️
                    </Badge>
                  )}
                  {post.author?.role === 'moderator' && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] px-1.5 py-0 leading-5 flex-shrink-0 font-semibold">
                      ⭐
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              {post.isAnonymous ? (
                <span>Anonymous User</span>
              ) : (
                <UserLink username={author.username}>
                  <span className="hover:text-emerald-600 transition-colors truncate">
                    @{author.username}
                  </span>
                </UserLink>
              )}
              <span className="flex-shrink-0">•</span>
              <time className="flex-shrink-0">{formatTimeAgo(post.createdAt)}</time>
              {post.imprintStatus && post.imprintStatus !== "none" && (
                <PostMeta 
                  imprintStatus={post.imprintStatus} 
                  onChainProof={post.onChainProof}
                />
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-700">
            ⚡ +{post.xpAwarded}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
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

        <CardContent className="px-3 pb-0 md:px-6">
        {pollData ? (
          <div className="mb-4">
            <PollDisplay
              poll={pollData}
              userVotes={getUserVotes()}
              onVote={handlePollVote}
              currentUserId={user?.id as string}
            />
          </div>
        ) : null}
        
        {post.content && (
          <div 
            className="text-sm md:text-[15px] leading-6 md:leading-7 mb-3 break-words overflow-wrap-anywhere word-wrap break-word whitespace-pre-wrap cursor-pointer"
            onClick={handlePostClick}
          >
            <PostContent content={post.content} onCopyCode={handleCopyCode} />
          </div>
        )}

        {/* Legacy single image support */}
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            {post.imageUrl.includes('video') || post.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video 
                controls
                className="w-full h-auto rounded-lg"
                preload="metadata"
                style={{ maxHeight: '70vh' }}
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
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '70vh' }}
              />
            )}
          </div>
        )}

        {/* Multiple images support */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-3">
            {post.imageUrls.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrls[0]}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '70vh' }}
                  onError={(e) => {
                    console.error('Image failed to load:', post.imageUrls?.[0]);
                    e.currentTarget.style.display = 'none';
                  }}
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
                      className="w-full h-auto rounded-md"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos support */}
        {post.videoUrls && post.videoUrls.length > 0 && (
          <div className="mb-3">
            {post.videoUrls.map((videoUrl, index) => (
              <div key={index} className="rounded-lg overflow-hidden mb-2 last:mb-0">
                <video 
                  controls
                  className="w-full h-auto rounded-lg"
                  preload="metadata"
                  style={{ maxHeight: '70vh' }}
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

        {post.linkPreview && (
          <div className="mb-3">
            <a 
              href={post.linkPreview.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkPreviewCard
                title={post.linkPreview.title}
                description={post.linkPreview.description}
                image={post.linkPreview.image}
                url={post.linkPreview.url}
                siteName={post.linkPreview.siteName}
                onRemove={() => {}}
              />
            </a>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer text-xs px-2 py-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tag/${encodeURIComponent(tag)}`);
                }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        </CardContent>

        <div className="flex items-center gap-2 md:gap-6 p-3 md:px-6 interactive-element">
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 transition-colors ${
            post.isLiked ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-red-600"
          }`}
          onClick={handleLikeClick}
          aria-pressed={post.isLiked}
          title="Like"
        >
          <Heart className={`h-4 w-4 transition-all ${
            post.isLiked ? "fill-red-600 text-red-600" : ""
          }`} />
          <span className="text-xs">{post.likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-foreground"
          onClick={handleCommentClick}
          title="Comment"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">{post.commentsCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-foreground"
          onClick={handleShareClick}
          title="Share"
        >
          <Share className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Share</span>
        </Button>

        {!post.isAnonymous && post.author && user && post.author.username !== user.username && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTipModal(true);
                }}
              >
                <Coins className="h-4 w-4" />
                <span className="text-xs">Tip</span>
                <span className="sr-only">Send Tip</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send Tip</TooltipContent>
          </Tooltip>
        )}

        {!post.isAnonymous && post.author && user && post.author.username !== user.username && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTipModal(true);
                }}
              >
                <Coins className="h-4 w-4" />
                <span className="text-xs">Tip</span>
                <span className="sr-only">Send Tip</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send Tip</TooltipContent>
          </Tooltip>
        )}

        <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span>{post.viewsCount || 0}</span>
        </div>
        </div>

        {/* AI Actions */}
        <div className="px-4 pb-3 md:px-6">
          <PostAIActions 
            postContent={post.content} 
            postId={post.id}
          />
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
                              <UserAvatar 
                                user={comment.author}
                                className="w-10 h-10 flex-shrink-0"
                              />
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
                                <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                              </div>
                              <div className="text-gray-800 mb-3 leading-relaxed">
                                <MentionText text={comment.content} />
                              </div>
                              {comment.imageUrl && (
                                <div className="mb-3 rounded-lg overflow-hidden">
                                  <Image
                                    src={comment.imageUrl}
                                    alt="Comment image"
                                    width={400}
                                    height={300}
                                    className="w-full h-auto rounded-lg"
                                    style={{ maxHeight: '400px' }}
                                  />
                                </div>
                              )}
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
                                {user && comment.author.username === user.username && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={async () => {
                                          try {
                                            const response = await apiClient.request(`/comments/delete/${comment.id}`, { method: 'DELETE' });
                                            if (response.success) {
                                              setComments(comments.filter(c => c.id !== comment.id));
                                              toast({ title: "Comment deleted", variant: "success" });
                                            }
                                          } catch (error) {
                                            toast({ title: "Failed to delete comment", variant: "destructive" });
                                          }
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
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
                    {user && (
                      <UserAvatar 
                        user={{
                          username: user.username || '',
                          avatar: user.avatar,
                          displayName: user.displayName
                        }}
                        className="w-8 h-8 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <EnhancedCommentInput
                        placeholder="Write a comment..."
                        onSubmit={submitComment}
                        disabled={submittingComment}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

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
            });
          }}
        />
      )}
    </TooltipProvider>
  );
}