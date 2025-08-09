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
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-sm">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              </div>
              
              <div className="flex-shrink-0 ml-2">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" onClick={handleEditToggle}>
                    <Edit2 size={12} className="mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
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

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={10} />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>Joined {profile.joinDate}</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-foreground leading-relaxed mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{profile.bio}</p>
            )}

            {/* Follow Stats */}
            {profile.userId && profile.username && (
              <div className="mb-2">
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
                {profile.techStack.slice(0, 4).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                    {tech}
                  </Badge>
                ))}
                {profile.techStack.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{profile.techStack.length - 4}
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