"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
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
  // Convert Ready Player Me .glb URLs to proper image URLs
  let displaySrc = src
  
  if (src?.includes('models.readyplayer.me') && src.endsWith('.glb')) {
    // Extract avatar ID from GLB URL and create proper image URL
    const avatarId = src.split('/').pop()?.replace('.glb', '')
    displaySrc = `https://models.readyplayer.me/${avatarId}.png`
  }
  
  // Fallback to placeholder if no src
  if (!displaySrc || displaySrc === '/placeholder.svg') {
    displaySrc = '/placeholder-user.jpg'
  }
  
  console.log('SmartAvatar render:', { src, displaySrc, className })
  
  return (
    <Avatar className={className}>
      <AvatarImage 
        src={displaySrc} 
        alt={alt}
        onError={(e) => {
          console.log('Avatar image failed to load:', displaySrc)
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