'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Heart, Code, Calendar, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface KnowledgeEntry {
  _id: string
  title: string
  technology: string
  category: string
  content: string
  codeExample?: string
  tags: string[]
  author: {
    username: string
    profilePicture?: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
}

interface KnowledgeCardProps {
  entry: KnowledgeEntry
  onLike: () => void
}

export function KnowledgeCard({ entry, onLike }: KnowledgeCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{entry.technology}</Badge>
              <Badge variant="outline">{entry.category}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant={entry.isLiked ? "default" : "outline"}
            size="sm"
            onClick={onLike}
            className="flex items-center gap-1"
          >
            <Heart className={`w-4 h-4 ${entry.isLiked ? 'fill-current' : ''}`} />
            {entry.likes}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>{entry.content}</p>
        </div>

        {/* Code Example */}
        {entry.codeExample && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Code className="w-4 h-4" />
              Code Example
            </div>
            <div className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={entry.technology.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {entry.codeExample}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Author and Date */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <UserAvatar 
              user={{
                username: entry.author.username,
                avatar: entry.author.profilePicture,
                displayName: entry.author.username
              }}
              className="w-6 h-6"
            />
            <span className="text-sm font-medium">{entry.author.username}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}