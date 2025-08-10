"use client"

import React, { useState } from 'react'
import { MapPin, Calendar, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FollowStats } from '@/components/shared/FollowStats'
import { FollowButton } from '@/components/shared/FollowButton'
import { useAuth } from '@/contexts/auth-context'

interface SocialLink {
  platform: string
  icon: string
  url: string
}

interface ProfileData {
  name: string
  title: string
  location: string
  joinDate: string
  bio: string
  avatar: string
  techStack: string[]
  socialLinks: SocialLink[]
  userId?: string
  username?: string
  followersCount?: number
  followingCount?: number
  isFollowing?: boolean
}

interface ProfileHeaderProps {
  profile: ProfileData
  onEdit: () => void
  isOwnProfile?: boolean
  setProfileData?: React.Dispatch<React.SetStateAction<ProfileData>>
}

export default function ProfileHeader({ profile, onEdit, isOwnProfile = false, setProfileData }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { user: currentUser } = useAuth()

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    onEdit()
  }

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-lg sm:text-xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                  {profile.name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">{profile.title}</p>
              </div>
              
              <div className="flex-shrink-0 ml-2">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" onClick={handleEditToggle} className="h-8 px-3 text-xs">
                    <Edit2 size={12} className="mr-1" />
                    <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit'}</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                ) : (
                  profile.userId && profile.username && currentUser && (
                    <FollowButton
                      key={`${profile.userId}-${profile.isFollowing}`}
                      userId={profile.userId}
                      username={profile.username}
                      isFollowing={profile.isFollowing || false}
                      size="sm"
                      onFollowChange={(isFollowing, delta) => {
                        if (setProfileData) {
                          setProfileData(prev => ({
                            ...prev,
                            isFollowing,
                            followersCount: Math.max(0, (prev.followersCount || 0) + delta)
                          }));
                        }
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate">{profile.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span className="truncate">Joined {profile.joinDate}</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs sm:text-sm text-foreground leading-relaxed mb-3 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{profile.bio}</p>
            )}

            {/* Follow Stats */}
            {profile.userId && profile.username && (
              <div className="mb-3">
                <FollowStats
                  key={profile.userId}
                  userId={profile.userId}
                  username={profile.username}
                  initialFollowersCount={profile.followersCount || 0}
                  initialFollowingCount={profile.followingCount || 0}
                  className="text-xs"
                />
              </div>
            )}

            {/* Tech Stack */}
            {profile.techStack && profile.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.techStack.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                    {tech}
                  </Badge>
                ))}
                {profile.techStack.length > 3 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                    +{profile.techStack.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}