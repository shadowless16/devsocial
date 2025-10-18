"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { generateDiceBearAvatar, getAvatarStyleForUser } from "@/lib/dicebear-avatar"
import { LevelFrame } from "./level-frame"
import { User } from "lucide-react"
import { useMemo } from "react"

interface SmartAvatarProps {
  src?: string
  alt?: string
  username?: string
  level?: number
  className?: string
  fallback?: React.ReactNode
  size?: number
  showLevelFrame?: boolean
}

export function SmartAvatar({ 
  src, 
  alt = "Avatar", 
  username,
  level = 1,
  className = "", 
  fallback,
  size,
  showLevelFrame = true
}: SmartAvatarProps) {
  const displaySrc = useMemo(() => {
    let avatarSrc = getAvatarUrl(src)
    
    if (!avatarSrc || avatarSrc === '/placeholder.svg' || avatarSrc === '/placeholder-user.jpg') {
      if (username) {
        const style = getAvatarStyleForUser(username)
        return generateDiceBearAvatar(username, style)
      }
      return '/placeholder-user.jpg'
    }
    
    return avatarSrc
  }, [src, username])
  
  const avatarContent = (
    <Avatar className={className}>
      <AvatarImage 
        src={displaySrc} 
        alt={alt}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (username && !target.src.startsWith('data:')) {
            const style = getAvatarStyleForUser(username)
            target.src = generateDiceBearAvatar(username, style)
          } else if (target.src !== '/placeholder-user.jpg') {
            target.src = '/placeholder-user.jpg'
          }
        }}
      />
      <AvatarFallback>
        {fallback || <User className="w-4 h-4" />}
      </AvatarFallback>
    </Avatar>
  )
  
  if (showLevelFrame && level) {
    return (
      <LevelFrame level={level} className={className}>
        {avatarContent}
      </LevelFrame>
    )
  }
  
  return avatarContent
}