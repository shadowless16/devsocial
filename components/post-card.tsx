"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Flag, Coins, Eye } from "lucide-react"
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
      <Card className="group relative w-full min-w-0 max-w-full border-0 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[1px] cursor-pointer overflow-hidden">
        <CardContent className="p-3 space-y-3">
          {/* Header Section */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Avatar */}
            <div 
              className="flex-shrink-0 cursor-pointer hover:ring-primary/20 transition-all"
              onClick={(e) => { e.stopPropagation(); window.location.href = `/profile/${handle?.replace('@', '')}`}}
            >
              <Avatar className="h-12 w-12 ring-1 ring-primary/20">
                <AvatarImage 
                  src={getAvatarUrl(avatar)} 
                  alt={author}
                />
                <AvatarFallback className="text-sm">
                  {author?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
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
                className="text-base mb-3 w-full break-words whitespace-pre-line overflow-wrap-anywhere"
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
                      className="w-full h-auto object-cover max-h-60 rounded-lg"
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
                          className="w-full h-auto object-cover max-h-60 rounded-lg"
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
                              className="w-full h-24 sm:h-32 object-cover rounded-md"
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
                          className="w-full max-h-60 object-cover rounded-lg"
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


          
          {/* Actions Footer */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {/* Main Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-red-500 ${
                    isLiked ? "text-red-500" : ""
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 transition ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-sm font-medium">{currentLikesCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-blue-500"
                  onClick={() => postId && onComment?.(postId)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{commentsCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-green-500"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Share</span>
                </Button>
              </div>
              
              {/* Tip Button - Separate from main actions */}
              {user && authorId && user.id !== authorId && (
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
            
            {/* Views Counter - Separate row for better mobile layout */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{currentViews} views</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(timestamp)}
              </div>
            </div>
          </div>
            </div>
          </div>
        
        {/* Accent sheen */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 translate-y-[-8px] bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </CardContent>
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