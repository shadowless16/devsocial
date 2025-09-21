"use client"

import { useState, useEffect } from "react"
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
  
  useEffect(() => {
    setIsLiked(liked)
    setCurrentLikesCount(likesCount)
  }, [liked, likesCount])

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
        <Card className="border-0 ring-1 ring-black/5 w-full max-w-full overflow-hidden">
          <CardContent className="p-3 md:p-4 w-full max-w-full">
          <div className="flex items-start gap-2 md:gap-3 w-full">
            <div 
              className="cursor-pointer hover:ring-primary/20 transition-all flex-shrink-0"
              onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
            >
              <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-1 ring-primary/20">
                <AvatarImage 
                  src={getAvatarUrl(avatar)} 
                  alt={author}
                />
                <AvatarFallback>
                  {author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0 w-full overflow-hidden">
              <div className="flex items-start justify-between mb-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1 md:gap-2 min-w-0">
                    <span 
                      className="font-medium text-sm md:text-sm cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                    >{author}</span>
                    <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5 flex-shrink-0">{level}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span 
                      className="cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                    >{handle}</span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">{formatTimeAgo(timestamp)}</span>
                    {xpDelta > 0 && (
                      <Badge className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-0.5 flex-shrink-0">
                        +{xpDelta}
                      </Badge>
                    )}
                    {imprintStatus && imprintStatus !== "none" && (
                      <PostMeta 
                        imprintStatus={imprintStatus} 
                        onChainProof={onChainProof}
                      />
                    )}
                  </div>
                </div>
                
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
              
              <div 
                  className="text-sm md:text-sm mb-3 md:mb-3 cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors w-full min-w-0 overflow-hidden"
                onClick={() => postId && onClick?.(postId)}
              >
                <div className="w-full min-w-0 overflow-hidden">
                  <PostContent content={content || ""} onCopyCode={handleCopyCode} />
                </div>
              </div>

              {/* Image Display */}
              {imageUrl && (
                <div className="mb-2 md:mb-3 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Post image"
                    className="w-full h-auto object-cover max-h-96 rounded-lg cursor-pointer"
                    onClick={() => postId && onClick?.(postId)}
                  />
                </div>
              )}

              {/* Multiple Images */}
              {imageUrls && imageUrls.length > 0 && (
                <div className="mb-2 md:mb-3">
                  {imageUrls.length === 1 ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={imageUrls[0]}
                        alt="Post image"
                        className="w-full h-auto object-cover max-h-96 rounded-lg cursor-pointer"
                        onClick={() => postId && onClick?.(postId)}
                      />
                    </div>
                  ) : (
                    <div className={`grid gap-2 rounded-lg overflow-hidden ${
                      imageUrls.length === 2 ? 'grid-cols-2' :
                      imageUrls.length === 3 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {imageUrls.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className={`relative cursor-pointer ${
                            imageUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                          }`}
                          onClick={() => postId && onClick?.(postId)}
                        >
                          <img
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Videos */}
              {videoUrls && videoUrls.length > 0 && (
                <div className="mb-2 md:mb-3">
                  {videoUrls.map((videoUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden mb-2 last:mb-0">
                      <video 
                        controls
                        className="w-full max-h-96 object-cover rounded-lg"
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

              {/* Tags */}
              {/* Add tags prop to interface and display them */}
              
              {/* AI Actions */}
              <div className="mb-3">
                <PostAIActions 
                  postContent={content || ""} 
                  postId={postId || ""}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 md:gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-red-500 ${
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
                    className="h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-blue-500"
                    onClick={() => postId && onComment?.(postId)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{commentsCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-green-500"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">Share</span>
                  </Button>

                  {user && authorId && user.id !== authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1 md:gap-2 rounded-full px-2 md:px-3 text-muted-foreground hover:text-yellow-600"
                      onClick={() => setShowTipModal(true)}
                    >
                      <Coins className="h-4 w-4" />
                      <span className="text-xs hidden sm:inline">Tip</span>
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {views} views
                </div>
              </div>
            </div>
          </div>
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