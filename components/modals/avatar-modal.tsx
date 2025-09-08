"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar3D } from '@/components/ui/avatar-3d'
import { Avatar } from '@/components/ui/avatar'
import { AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar-utils'

interface AvatarModalProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

export function AvatarModal({ isOpen, onClose, avatarUrl, username }: AvatarModalProps) {
  const base = avatarUrl ? String(avatarUrl).split('?')[0] : ''
  const is3D = base.endsWith('.glb')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{username}'s Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          {is3D ? (
            <div className="w-80 h-80">
              <Avatar3D modelUrl={avatarUrl} />
            </div>
          ) : (
            <Avatar className="w-80 h-80">
              <AvatarImage src={getAvatarUrl(avatarUrl)} alt={`${username}'s avatar`} />
            </Avatar>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}