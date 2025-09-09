"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Copy, Flag, Coins } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useToast } from "@/hooks/use-toast"
import { ReportModal } from "@/components/modals/report-modal"
import { TipModal } from "@/components/modals/tip-modal"
import { formatTimeAgo } from "@/lib/time-utils"
import { PostMeta } from "@/components/shared/PostMeta"
import { PostAIActions } from "@/components/shared/PostAIActions"
import { useAuth } from "@/contexts/auth-context"
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Code snippet copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      })
    }
  }

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
      <Card className="border-0 ring-1 ring-black/5 w-full overflow-hidden">
        <CardContent className="p-3 md:p-4 w-full">
          <div className="flex items-start gap-2 md:gap-3 w-full">
            <div 
              className="cursor-pointer hover:ring-primary/20 transition-all flex-shrink-0"
              onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
            >
              <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-1 ring-primary/20">
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
              <div className="flex items-center justify-between mb-1 w-full">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap min-w-0 flex-1 mr-2">
                  <span 
                    className="font-medium text-xs md:text-sm cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                  >{author}</span>
                  <Badge className="bg-primary/10 text-primary text-[10px] md:text-xs px-1 md:px-2 flex-shrink-0">{level}</Badge>
                  <span 
                    className="text-[10px] md:text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors hidden sm:inline truncate"
                    onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                  >{handle}</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline flex-shrink-0">•</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline flex-shrink-0">{formatTimeAgo(timestamp)}</span>
                  {xpDelta > 0 && (
                    <Badge className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-[10px] md:text-xs px-1 md:px-2 flex-shrink-0">
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
                className="text-xs md:text-sm mb-2 md:mb-3 prose prose-sm max-w-none cursor-pointer hover:bg-muted/50 rounded-md p-1 md:p-2 -m-1 md:-m-2 transition-colors w-full overflow-hidden break-words"
                onClick={() => postId && onClick?.(postId)}
              >
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeString = String(children).replace(/\n$/, '')
                      const isInline = !match
                      
                      return !isInline && match ? (
                        <div className="relative group">
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md text-xs"
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border border-border text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(codeString)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
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

              {/* AI Actions */}
              <div className="mb-3">
                <PostAIActions 
                  postContent={content || ""} 
                  postId={postId || ""}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-red-500 ${
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
                    className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-blue-500"
                    onClick={() => postId && onComment?.(postId)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{commentsCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-green-500"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-xs">Share</span>
                  </Button>

                  {user && authorId && user.id !== authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-yellow-600"
                      onClick={() => setShowTipModal(true)}
                    >
                      <Coins className="h-4 w-4" />
                      <span className="text-xs">Tip</span>
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
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