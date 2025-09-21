"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface Community {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  postCount: number
  isJoined: boolean
  avatar: string
}

interface CommunityCardProps {
  community: Community
  onJoinToggle: (communityId: string) => void
}

export function CommunityCard({ community, onJoinToggle }: CommunityCardProps) {
  const router = useRouter()

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the join/leave button
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    router.push(`/community/${community.id}`)
  }

  return (
    <Card
      className="bg-card border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {community.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground text-lg leading-tight">{community.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {community.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm leading-relaxed">{community.description}</p>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{formatCount(community.memberCount)} members</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{formatCount(community.postCount)} posts</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation() // Prevent card click when clicking join/leave button
            onJoinToggle(community.id)
          }}
          variant={community.isJoined ? "destructive" : "default"}
          className={`w-full transition-colors ${
            community.isJoined
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {community.isJoined ? "Leave" : "Join"}
        </Button>
      </CardFooter>
    </Card>
  )
}