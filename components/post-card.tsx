"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from 'next/image';
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Flag, Coins, Eye, Bookmark } from "lucide-react"
import { PostContent } from "@/components/shared/PostContent"
import { useToast } from "@/hooks/use-toast"
import { ReportModal } from "@/components/modals/report-modal"
import { TipModal } from "@/components/modals/tip-modal"
import { formatTimeAgo } from "@/lib/core/time-utils"
import { PostMeta } from "@/components/shared/PostMeta"
import { PostAIActions } from "@/components/shared/PostAIActions"
import { useAuth } from "@/contexts/app-context"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAvatarUrl } from "@/lib/storage/avatar-utils"
import { PollDisplay } from "@/components/poll/poll-display"
import { apiClient } from "@/lib/api/api-client"
import { LinkPreviewCard } from "@/components/ui/link-preview-card"
import { Textarea } from "@/components/ui/textarea"
import { UserLink } from "@/components/shared/UserLink"
import { MentionText } from "@/components/ui/mention-text"

interface PostCardProps {
  author?: string
  handle?: string
  level?: string
  authorRole?: string
  xpDelta?: number
  content?: string
  views?: number
  liked?: boolean
  bookmarked?: boolean
  timestamp?: string
  avatar?: string
  postId?: string
  currentUserId?: string
  authorId?: string
  likesCount?: number
  commentsCount?: number
  imageUrl?: string | null
  imageUrls?: string[]
  videoUrls?: string[]
  imprintStatus?: "none" | "pending" | "submitted" | "confirmed" | "failed" | "duplicate"
  onChainProof?: {
    txId?: string
    topicId?: string
    seq?: number
  } | null
  onDelete?: (postId: string) => void
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onBookmark?: (postId: string) => void
  onClick?: (postId: string) => void
  linkPreview?: {
    title: string
    description: string
    image?: string
    url: string
    siteName: string
  }
  poll?: {
    question: string
    options: Array<{
      id: string
      text: string
      votes: number
      voters: string[]
    }>
    settings: {
      multipleChoice: boolean
      maxChoices: number
      showResults: "always" | "afterVote" | "afterEnd"
      allowAddOptions: boolean
    }
    endsAt?: string
    totalVotes: number
  }
}

export default function PostCard({
  author = "Akinwumi David",
  handle = "@AkDavid",
  level = "L1",
  authorRole,
  xpDelta = 20,
  content = "lol",
  views = 1,
  liked = false,
  bookmarked = false,
  timestamp = "2025-08-08T15:06:37.356Z",
  avatar,
  postId,
  currentUserId,
  authorId,
  likesCount = 0,
  commentsCount = 0,
  imageUrl,
  imageUrls,
  videoUrls,
  imprintStatus,
  onChainProof,
  onDelete,
  onLike,
    onBookmark,
  onClick,
  linkPreview,
  poll
}: PostCardProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(liked)
  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [currentViews, setCurrentViews] = useState(views)
  const viewTracked = useRef(false)
  const [pollData, setPollData] = useState(poll)
  const [showComments, setShowComments] = useState(false)
interface CommentAuthor {
  username: string
  displayName?: string
  avatar?: string
  level?: number
}

interface Comment {
  id?: string
  _id?: string
  author: CommentAuthor
  content: string
  createdAt: string
  isLiked?: boolean
  likesCount?: number
}

  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  
  useEffect(() => {
    setIsLiked(liked)
    setIsBookmarked(bookmarked)
    setCurrentLikesCount(likesCount)
    setCurrentViews(views)
  }, [liked, bookmarked, likesCount, views])

  const trackView = useCallback(async () => {
    if (!postId) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Only increment if it's a new view (not already viewed recently)
        if (data.success && !data.alreadyViewed) {
          setCurrentViews(prev => prev + 1)
        }
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to track view:', errorMessage)
    }
  }, [postId])

  // Track view when component mounts
  useEffect(() => {
    if (postId && !viewTracked.current) {
      viewTracked.current = true
      trackView()
    }
  }, [postId, trackView])

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

  const handleLike = async () => {
    if (!postId || !onLike) return
    
    const previousLiked = isLiked
    const previousCount = currentLikesCount
    
    setIsLiked(!previousLiked)
    setCurrentLikesCount(previousLiked ? previousCount - 1 : previousCount + 1)
    
    try {
      await onLike(postId)
    } catch {
      setIsLiked(previousLiked)
      setCurrentLikesCount(previousCount)
    }
  }

  const handleBookmark = async () => {
    if (!postId || !onBookmark) return
    
    const previousBookmarked = isBookmarked
    setIsBookmarked(!previousBookmarked)
    
    try {
      await onBookmark(postId)
      toast({
        title: isBookmarked ? "Bookmark removed" : "Post bookmarked",
        description: isBookmarked ? "Removed from your bookmarks" : "Added to your bookmarks",
      })
    } catch {
      setIsBookmarked(previousBookmarked)
      toast({
        title: "Failed to bookmark",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${postId}`
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${author}`,
          text: content?.substring(0, 100) + (content && content.length > 100 ? '...' : ''),
          url: postUrl
        })
      } else {
        await navigator.clipboard.writeText(postUrl)
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        })
      }
    } catch {
      console.log('Share cancelled or failed')
    }
  }

  return (
    <>
    <Card className="glass-panel group relative w-full min-w-0 max-w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden">
        <CardContent className="p-3 space-y-3">
          {/* Header Section */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Avatar */}
            <div 
              className="flex-shrink-0 cursor-pointer hover:ring-primary/20 transition-all"
              onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
            >
              <UserAvatar 
                user={{
                  username: handle?.replace('@', '') || 'user',
                  avatar: avatar || '',
                  displayName: author
                }}
                className="h-12 w-12 ring-1 ring-primary/20"
                showLevelFrame={false}
              />
            </div>
            
            {/* User Info & Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* User Details */}
              <div className="flex items-start justify-between min-w-0">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="font-medium text-base cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
                    >
                      {author}
                    </span>
                    <Badge variant="secondary" className="text-sm px-2 py-0 h-6 flex-shrink-0">
                      {level}
                    </Badge>
                    {authorRole === 'admin' && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0 h-6 flex-shrink-0 font-semibold">
                        🛡️
                      </Badge>
                    )}
                    {authorRole === 'moderator' && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-1.5 py-0 h-6 flex-shrink-0 font-semibold">
                        ⭐
                      </Badge>
                    )}
                    {xpDelta > 0 && (
                      <Badge className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm px-2 py-0 h-6 flex-shrink-0">
                        +{xpDelta}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span 
                      className="cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
                    >
                      {handle}
                    </span>
                    {imprintStatus && imprintStatus !== "none" && (
                      <PostMeta 
                        imprintStatus={imprintStatus} 
                        onChainProof={onChainProof}
                      />
                    )}
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookmark()
                      }}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </DropdownMenuItem>
                    {user && authorId && user.id !== authorId && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTipModal(true)
                        }}
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Tip author
                      </DropdownMenuItem>
                    )}
                    {currentUserId === authorId ? (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (postId && onDelete) onDelete(postId)
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowReportModal(true)
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Poll Display */}
              {pollData && (
                <div className="mb-4">
                  <PollDisplay
                    poll={pollData}
                    userVotes={pollData.options.filter(opt => opt.voters.includes(user?.id || '')).map(opt => opt.id)}
                    onVote={async (optionIds) => {
                      try {
                        const response = await apiClient.request<{ poll: typeof pollData; xpAwarded: number }>('/polls/vote', {
                          method: 'POST',
                          body: JSON.stringify({ postId, optionIds }),
                        })
                        if (response.success && response.data) {
                          setPollData(response.data.poll)
                          toast({
                            title: "Vote recorded!",
                            description: `+${response.data.xpAwarded} XP`,
                          })
                        }
                      } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
                        toast({
                          title: "Failed to vote",
                          description: errorMessage,
                          variant: "destructive",
                        })
                      }
                    }}
                    currentUserId={user?.id}
                  />
                </div>
              )}

              {/* Link Preview */}
              {linkPreview && (
                <div className="mb-3">
                  <a 
                    href={linkPreview.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkPreviewCard
                      title={linkPreview.title}
                      description={linkPreview.description}
                      image={linkPreview.image}
                      url={linkPreview.url}
                      siteName={linkPreview.siteName}
                      onRemove={() => {}}
                    />
                  </a>
                </div>
              )}

              {/* Post Content */}
              {content && (
              <div 
                className="text-base mb-3 w-full break-words whitespace-pre-line overflow-wrap-anywhere"
                onClick={(e) => {
                  if (e.target instanceof HTMLElement && (e.target.closest('a') || e.target.closest('button'))) {
                    return;
                  }
                  if (postId && onClick) onClick(postId)
                }}
              >
                <PostContent content={content || ""} onCopyCode={handleCopyCode} />
              </div>
              )}



              {/* Media Display */}
              <div className="w-full -mx-1" onClick={(e) => {
                  if (e.target instanceof HTMLElement && (e.target.closest('a') || e.target.closest('button') || e.target.closest('video'))) {
                    return;
                  }
                  if (postId && onClick) onClick(postId)
                }}>
                {imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-border">
                    {(imageUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) || imageUrl.includes('video') || imageUrl.includes('.mp4')) ? (
                      <video 
                        controls
                        className="w-full h-auto rounded-lg max-h-[500px]"
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <source src={imageUrl} type="video/mp4" />
                        <source src={imageUrl} type="video/webm" />
                        <source src={imageUrl} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Image
                        src={imageUrl}
                        alt="Post image"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    )}
                  </div>
                )}

                {imageUrls && imageUrls.length > 0 && (
                  <div className="mb-3">
                    {imageUrls.length === 1 ? (
                      <div className="rounded-lg overflow-hidden border border-border">
                        {(imageUrls[0].match(/\.(mp4|webm|ogg|mov)$/i) || imageUrls[0].includes('video')) ? (
                          <video 
                            controls
                            className="w-full h-auto rounded-lg max-h-[500px]"
                            preload="metadata"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <source src={imageUrls[0]} type="video/mp4" />
                            <source src={imageUrls[0]} type="video/webm" />
                            <source src={imageUrls[0]} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <Image
                            src={imageUrls[0]}
                            alt="Post image"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        )}
                      </div>
                    ) : (
                      <div className={`grid gap-2 rounded-lg overflow-hidden ${
                        imageUrls.length === 2 ? 'grid-cols-2' :
                        imageUrls.length === 3 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {imageUrls.slice(0, 4).map((imageUrl, index) => (
                          <div 
                            key={index} 
                            className={`relative border border-border rounded-lg overflow-hidden ${
                              imageUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                            }`}
                          >
                            <Image
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                            />
                            {index === 3 && imageUrls.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                                <span className="text-white font-medium text-sm">+{imageUrls.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Videos */}
                {videoUrls && videoUrls.length > 0 && (
                  <div className="mb-3">
                    {videoUrls.map((videoUrl, index) => (
                      <div key={index} className="rounded-lg overflow-hidden mb-2 last:mb-0 border border-border">
                        <video 
                          controls
                          className="w-full max-h-[500px] object-contain rounded-lg"
                          preload="metadata"
                          onClick={(e) => e.stopPropagation()}
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

          
          {/* AI Actions */}
          {content && (
            <div className="mb-3">
              <PostAIActions 
                postContent={content} 
                postId={postId || ""}
              />
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-3 border-t border-gray-100">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-2 rounded-full px-3 transition-colors ${
                  isLiked ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-red-600"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 transition-all ${
                  isLiked ? "fill-red-600 text-red-600" : ""
                }`} />
                <span className="text-sm font-medium">{currentLikesCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-blue-500"
                onClick={async (e) => {
                  e.stopPropagation()
                  if (!showComments && postId) {
                    setLoadingComments(true)
                    try {
                      const response = await apiClient.getComments(postId)
                      if (response.success && response.data) {
                        setComments((response.data as { comments: Comment[] }).comments || [])
                      }
                    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to fetch comments:', errorMessage)
                    } finally {
                      setLoadingComments(false)
                    }
                  }
                  setShowComments(!showComments)
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-muted-foreground hover:text-green-500"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Views and Time - Separate row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{currentViews} views</span>
              </div>
              <span>{formatTimeAgo(timestamp)}</span>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id || comment._id} className="flex items-start space-x-2">
                          <UserLink username={comment.author?.username || ''}>
                            <UserAvatar 
                              user={{
                                username: comment.author?.username || '',
                                displayName: comment.author?.displayName,
                                avatar: comment.author?.avatar,
                                level: comment.author?.level
                              }}
                              className="w-8 h-8 flex-shrink-0"
                            />
                          </UserLink>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <UserLink username={comment.author?.username || ''}>
                                <span className="font-semibold text-sm hover:text-emerald-600">
                                  {comment.author?.displayName || comment.author?.username || 'Unknown'}
                                </span>
                              </UserLink>
                              <Badge variant="outline" className="text-xs px-1 py-0">L{comment.author.level || 1}</Badge>
                              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <div className="text-sm text-gray-800">
                              <MentionText text={comment.content} />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const commentId = (comment.id || comment._id) as string
                                    const response = await apiClient.toggleCommentLike(commentId)
                                    if (response.success && response.data) {
                                      const { liked, likesCount } = response.data as { liked: boolean; likesCount: number }
                                      setComments(comments.map((c) => 
                                        (c.id || c._id) === commentId
                                          ? { ...c, isLiked: liked, likesCount }
                                          : c
                                      ))
                                    }
                                  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to like comment:', errorMessage)
                                  }
                                }}
                                className={`h-6 px-2 text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                              >
                                <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                                <span className="ml-1">{comment.likesCount || 0}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Comment Input */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start space-x-2">
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
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            onClick={async () => {
                              if (!commentContent.trim() || submittingComment || !postId) return
                              setSubmittingComment(true)
                              try {
                                const response = await apiClient.createComment(postId, commentContent.trim())
                                if (response.success && response.data) {
                                  const newComment = (response.data as { comment: Comment }).comment
                                  setComments([newComment, ...comments])
                                  setCommentContent("")
                                  toast({ title: "Comment posted!" })
                                }
                              } catch {
                                toast({ title: "Failed to post comment", variant: "destructive" })
                              } finally {
                                setSubmittingComment(false)
                              }
                            }}
                            disabled={!commentContent.trim() || submittingComment}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {submittingComment ? 'Posting...' : 'Post'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        
        {/* Accent sheen */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 translate-y-[-8px] bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </CardContent>
      </Card>      
      
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postId || ""}
      />

      {user && authorId && user.id !== authorId && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientId={authorId}
          recipientName={author}
          recipientAvatar={avatar}
          currentUserId={user.id}
          currentUserBalance={user.demoWalletBalance || 0}
          onTipSent={() => {
            toast({
              title: "Tip sent!",
              description: `Successfully tipped ${author}`,
            });
          }}
        />
      )}
    </>
  )
}