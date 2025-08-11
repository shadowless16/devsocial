"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Copy, Flag } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useToast } from "@/hooks/use-toast"
import { getLikeTooltip, GAMIFIED_TERMS } from "@/lib/gamified-terms"
import { ReportModal } from "@/components/modals/report-modal"

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
  onDelete,
  onLike,
  onComment,
  onClick
}: PostCardProps) {
  const { toast } = useToast()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLiked, setIsLiked] = useState(liked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [isCommentHovered, setIsCommentHovered] = useState(false)
  const [isShareHovered, setIsShareHovered] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

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
    
    // Optimistic update
    setIsLiked(!isLiked)
    setCurrentLikesCount(isLiked ? currentLikesCount - 1 : currentLikesCount + 1)
    
    try {
      await onLike(postId)
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setCurrentLikesCount(currentLikesCount)
    }
  }

  const handleComment = () => {
    if (!postId || !onComment) return
    onComment(postId)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${author}`,
          text: content,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        })
      }
    } catch (error) {
      console.log('Share cancelled or failed')
    }
  }
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US') + " " + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <Avatar 
            className="h-8 w-8 md:h-10 md:w-10 ring-1 ring-emerald-100 cursor-pointer hover:ring-emerald-200 transition-all flex-shrink-0"
            onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
          >
            <AvatarImage src={avatar || "/generic-user-avatar.png"} alt={author} />
            <AvatarFallback className="text-xs md:text-sm">{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <span 
                  className="font-medium text-xs md:text-sm cursor-pointer hover:text-emerald-500 transition-colors truncate"
                  onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                >{author}</span>
                <Badge className="bg-emerald-50 text-emerald-700 text-[10px] md:text-xs px-1 md:px-2">{level}</Badge>
                <span 
                  className="text-[10px] md:text-xs text-muted-foreground cursor-pointer hover:text-emerald-500 transition-colors hidden sm:inline"
                  onClick={() => window.location.href = `/profile/${handle.replace('@', '')}`}
                >{handle}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">•</span>
                <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">{formatTimestamp(timestamp)}</span>
                {xpDelta > 0 && (
                  <Badge className="bg-yellow-50 text-yellow-700 text-[10px] md:text-xs px-1 md:px-2">
                    +{xpDelta}
                  </Badge>
                )}
              </div>
              
              <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
              className="text-xs md:text-sm mb-2 md:mb-3 prose prose-sm max-w-none cursor-pointer hover:bg-gray-50/50 rounded-md p-1 md:p-2 -m-1 md:-m-2 transition-colors"
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
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 text-white"
                          onClick={() => copyToClipboard(codeString)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 md:h-8 gap-1 md:gap-2 px-1 md:px-2 transition-colors ${
                    isLiked 
                      ? 'text-green-500 hover:text-green-600' 
                      : 'text-muted-foreground hover:text-green-500'
                  }`}
                  title={getLikeTooltip(isLiked)}
                  onClick={handleLike}
                >
                  <Heart className={`h-3 w-3 md:h-4 md:w-4 transition-colors ${isLiked ? 'fill-green-500 text-green-500' : ''}`} />
                  <span className="text-[10px] md:text-xs">{currentLikesCount}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 md:h-8 gap-1 md:gap-2 px-1 md:px-2 transition-colors ${
                    isCommentHovered 
                      ? 'text-blue-500 hover:text-blue-600' 
                      : 'text-muted-foreground hover:text-blue-500'
                  }`}
                  title={GAMIFIED_TERMS.COMMENT_TOOLTIP}
                  onClick={handleComment}
                  onMouseEnter={() => setIsCommentHovered(true)}
                  onMouseLeave={() => setIsCommentHovered(false)}
                >
                  <MessageCircle className={`h-3 w-3 md:h-4 md:w-4 transition-colors ${isCommentHovered ? 'text-blue-500' : ''}`} />
                  <span className="text-[10px] md:text-xs">{commentsCount}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 md:h-8 gap-1 md:gap-2 px-1 md:px-2 transition-colors ${
                    isShareHovered 
                      ? 'text-purple-500 hover:text-purple-600' 
                      : 'text-muted-foreground hover:text-purple-500'
                  }`}
                  title={GAMIFIED_TERMS.SHARE_TOOLTIP}
                  onClick={handleShare}
                  onMouseEnter={() => setIsShareHovered(true)}
                  onMouseLeave={() => setIsShareHovered(false)}
                >
                  <Share className={`h-3 w-3 md:h-4 md:w-4 transition-colors ${isShareHovered ? 'text-purple-500' : ''}`} />
                </Button>
              </div>
              
              <span className="text-[10px] md:text-xs text-muted-foreground">{views} {GAMIFIED_TERMS.VIEWS.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {showReportModal && postId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          postId={postId}
        />
      )}
    </Card>
  )
}