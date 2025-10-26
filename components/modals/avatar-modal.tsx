"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar-utils'

interface AvatarModalProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

export function AvatarModal({ isOpen, onClose, avatarUrl, username }: AvatarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{username}'s Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          <Avatar className="w-80 h-80">
            <AvatarImage src={getAvatarUrl(avatarUrl)} alt={`${username}'s avatar`} />
          </Avatar>
        </div>
      </DialogContent>
    </Dialog>
  )
}