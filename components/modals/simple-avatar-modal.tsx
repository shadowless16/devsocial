"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar-utils'

interface SimpleAvatarModalProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

export function SimpleAvatarModal({ isOpen, onClose, avatarUrl, username }: SimpleAvatarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{username}'s Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          <Avatar className="w-80 h-80">
            <AvatarImage src={getAvatarUrl(avatarUrl)} alt={`${username}'s avatar`} />
            <AvatarFallback className="text-6xl">
              {username.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      </DialogContent>
    </Dialog>
  )
}