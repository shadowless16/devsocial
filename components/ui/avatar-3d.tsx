"use client"

import dynamic from 'next/dynamic'
import { User } from 'lucide-react'
import { getAvatarUrl } from '@/lib/avatar-utils'

const AvatarModelViewer = dynamic(() => import('./avatar-model-viewer.client'), { ssr: false })

interface Avatar3DProps {
  src?: string
  modelUrl?: string
  className?: string
  size?: number
}

export function Avatar3D({ src, modelUrl, className = "", size = 100 }: Avatar3DProps) {
  const avatarUrl = modelUrl || src
  
  if (!avatarUrl) return null
  
  // Always show 2D version (.png) for profile avatars too
  // 3D will only be shown in the modal when clicked
  const displayUrl = getAvatarUrl(avatarUrl)
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <img 
        src={displayUrl} 
        alt="Avatar" 
        className="w-full h-full rounded-full object-cover"
      />
    </div>
  )
}