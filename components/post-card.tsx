"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Flag, Coins } from "lucide-react"
import { PostContent } from "@/components/shared/PostContent"
import { useToast } from "@/hooks/use-toast"
import { ReportModal } from "@/components/modals/report-modal"
import { TipModal } from "@/components/modals/tip-modal"
import { formatTimeAgo } from "@/lib/time-utils"
import { PostMeta } from "@/components/shared/PostMeta"
import { PostAIActions } from "@/components/shared/PostAIActions"
import { useAuth } from "@/contexts/app-context"
import { getAvatarUrl } from "@/lib/avatar-utils"

interface PostCardProps {
  author?: string
  handle?: string
  level?: string
  xpDelta?: number
  content?: string
  views?: number
  liked?: boolean
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
  onClick?: (postId: string) => void
}

export default function PostCard({
  author = "Akinwumi David",
  handle = "@AkDavid",
  level = "L1",
  xpDelta = 20,
  content = "lol",
  views = 1,
  liked = false,
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
  onComment,
  onClick
}: PostCardProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(liked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [currentViews, setCurrentViews] = useState(views)
  const viewTracked = useRef(false)
  
  useEffect(() => {
    setIsLiked(liked)
    setCurrentLikesCount(likesCount)
    setCurrentViews(views)
  }, [liked, likesCount, views])

  // Track view when component mounts
  useEffect(() => {
    if (postId && !viewTracked.current) {
      viewTracked.current = true
      trackView()
    }
  }, [postId])

  const trackView = async () => {
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
      console.error('Failed to track view:', error)
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

  const handleLike = async () => {
    if (!postId || !onLike) return
    
    const previousLiked = isLiked
    const previousCount = currentLikesCount
    
    setIsLiked(!previousLiked)
    setCurrentLikesCount(previousLiked ? previousCount - 1 : previousCount + 1)
    
    try {
      await onLike(postId)
    } catch (error) {
      setIsLiked(previousLiked)
      setCurrentLikesCount(previousCount)
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
    } catch (error) {
      console.log('Share cancelled or failed')
    }
  }

  return (
    <>
<Card className="group relative border-0 p-3 sm:p-4 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[1px] cursor-pointer w-[280px] sm:w-full box-border overflow-hidden">
        <div 
          className="flex items-start gap-2 sm:gap-3 w-full min-w-0"
        >
            {/* Avatar */}
            <div 
              className="cursor-pointer hover:ring-primary/20 transition-all flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
            >
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-1 ring-primary/20">
                <AvatarImage 
                  src={getAvatarUrl(avatar)} 
                  alt={author}
                />
                <AvatarFallback className="text-xs">
                  {author?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 w-full">
              {/* Header */}
              <div 
                className="flex items-start justify-between mb-2 w-full min-w-0"
                onClick={(e) => {
                  if (e.target instanceof HTMLElement && (e.target.closest('a') || e.target.closest('button'))) {
                    return;
                  }
                  postId && onClick?.(postId)
                }}
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
                    <span 
                      className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-[140px]"
                      onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
                    >
                      {author}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                        {level}
                      </Badge>
                      {xpDelta > 0 && (
                        <Badge className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs px-1.5 py-0 h-5">
                          +{xpDelta}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                    <span 
                      className="cursor-pointer hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-[120px]"
                      onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
                    >
                      {handle}
                    </span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">{formatTimeAgo(timestamp)}</span>
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
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {currentUserId === authorId ? (
                      <DropdownMenuItem 
                        onClick={() => postId && onDelete?.(postId)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => setShowReportModal(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Post Content */}
              <div 
                className="text-sm mb-3 w-full break-words whitespace-pre-line overflow-wrap-anywhere"
                onClick={(e) => {
                  if (e.target instanceof HTMLElement && (e.target.closest('a') || e.target.closest('button'))) {
                    return;
                  }
                  postId && onClick?.(postId)
                }}
              >
                <PostContent content={content || ""} onCopyCode={handleCopyCode} />
              </div>

              {/* Media Display */}
              <div className="w-full" onClick={(e) => {
                  if (e.target instanceof HTMLElement && (e.target.closest('a') || e.target.closest('button'))) {
                    return;
                  }
                  postId && onClick?.(postId)
                }}>
                {imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Post image"
                      className="w-full h-auto object-cover max-h-48 sm:max-h-80 rounded-lg"
                    />
                  </div>
                )}

                {imageUrls && imageUrls.length > 0 && (
                  <div className="mb-3">
                    {imageUrls.length === 1 ? (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={imageUrls[0]}
                          alt="Post image"
                          className="w-full h-auto object-cover max-h-48 sm:max-h-80 rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className={`grid gap-1 rounded-lg overflow-hidden ${
                        imageUrls.length === 2 ? 'grid-cols-2' :
                        imageUrls.length === 3 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {imageUrls.slice(0, 4).map((imageUrl, index) => (
                          <div 
                            key={index} 
                            className={`relative ${
                              imageUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-20 sm:h-32 object-cover rounded-md"
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
                      <div key={index} className="rounded-lg overflow-hidden mb-2 last:mb-0">
                        <video 
                          controls
                          className="w-full max-h-48 sm:max-h-80 object-cover rounded-lg"
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

              {/* AI Actions */}
              <div className="mb-3">
                <PostAIActions 
                  postContent={content || ""} 
                  postId={postId || ""}
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1 sm:gap-2 rounded-full px-1 sm:px-2 text-muted-foreground hover:text-red-500 flex-shrink-0 ${
                      isLiked ? "text-red-500" : ""
                    }`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 transition ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-xs">{currentLikesCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 sm:gap-2 rounded-full px-1 sm:px-2 text-muted-foreground hover:text-blue-500 flex-shrink-0"
                    onClick={() => postId && onComment?.(postId)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{commentsCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 sm:gap-2 rounded-full px-1 sm:px-2 text-muted-foreground hover:text-green-500 flex-shrink-0"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">Share</span>
                  </Button>

                  {user && authorId && user.id !== authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 sm:gap-2 rounded-full px-1 sm:px-2 text-muted-foreground hover:text-yellow-600 flex-shrink-0"
                      onClick={() => setShowTipModal(true)}
                    >
                      <Coins className="h-4 w-4" />
                      <span className="text-xs hidden sm:inline">Tip</span>
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex-shrink-0 pl-1 sm:pl-2 whitespace-nowrap">
                  Views {currentViews}
                </div>
              </div>
            </div>
          </div>
        
        {/* Accent sheen */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 translate-y-[-8px] bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Card>      <ReportModal
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