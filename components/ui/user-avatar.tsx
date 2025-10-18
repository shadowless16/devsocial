"use client"

import { SmartAvatar } from "./smart-avatar"

interface UserAvatarProps {
  user: {
    username: string
    displayName?: string
    avatar?: string
    level?: number
    gender?: 'male' | 'female' | 'other'
  }
  className?: string
  showLevelFrame?: boolean
}

export function UserAvatar({ user, className = "w-10 h-10", showLevelFrame = false }: UserAvatarProps) {
  return (
    <SmartAvatar
      src={user.avatar}
      username={user.username}
      level={user.level || 1}
      alt={user.displayName || user.username}
      className={className}
      showLevelFrame={showLevelFrame}
      gender={user.gender}
    />
  )
}
