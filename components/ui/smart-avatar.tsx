"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { getAvatarUrl } from "@/lib/storage/avatar-utils"
import { generateDiceBearAvatar } from "@/lib/storage/dicebear-avatar"
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
  showLevelFrame?: boolean
  gender?: 'male' | 'female' | 'other'
}

export function SmartAvatar({ 
  src, 
  alt = "Avatar", 
  username,
  level = 1,
  className = "", 
  fallback,
  showLevelFrame = true,
  gender
}: SmartAvatarProps) {
  const displaySrc = useMemo(() => {
    const avatarSrc = getAvatarUrl(src)
    
    // If no avatar or empty string, generate DiceBear
    if (!avatarSrc || avatarSrc === '' || avatarSrc === '/placeholder.svg' || avatarSrc === '/placeholder-user.jpg') {
      if (username) {
        return generateDiceBearAvatar(username, gender)
      }
      return '/placeholder-user.jpg'
    }
    
    // If it's a data URI (old DiceBear), regenerate
    if (avatarSrc.startsWith('data:image')) {
      if (username) {
        return generateDiceBearAvatar(username, gender)
      }
    }
    
    return avatarSrc
  }, [src, username, gender])
  
  const avatarContent = (
    <Avatar className={className}>
      <AvatarImage 
        src={displaySrc} 
        alt={alt}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (username && !target.src.startsWith('data:')) {
            target.src = generateDiceBearAvatar(username, gender)
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