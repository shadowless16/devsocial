"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { User } from "lucide-react"

interface SmartAvatarProps {
  src?: string
  alt?: string
  className?: string
  fallback?: React.ReactNode
  size?: number
}

export function SmartAvatar({ 
  src, 
  alt = "Avatar", 
  className = "", 
  fallback,
  size 
}: SmartAvatarProps) {
  // Normalize Ready Player Me URLs (handles query params and .glb -> .png)
  let displaySrc = getAvatarUrl(src)
  
  // Fallback to placeholder if no src
  if (!displaySrc || displaySrc === '/placeholder.svg') {
    displaySrc = '/placeholder-user.jpg'
  }
  
  return (
    <Avatar className={className}>
      <AvatarImage 
        src={displaySrc} 
        alt={alt}
        onError={(e) => {
          // Try fallback image
          const target = e.target as HTMLImageElement
          if (target.src !== '/placeholder-user.jpg') {
            target.src = '/placeholder-user.jpg'
          }
        }}
      />
      <AvatarFallback>
        {fallback || <User className="w-4 h-4" />}
      </AvatarFallback>
    </Avatar>
  )
}