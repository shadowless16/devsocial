"use client"

import React from 'react'
// import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getAvatarUrl } from '@/lib/storage/avatar-utils'
import NextImage from "next/image"

interface AvatarViewer3DProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

export function AvatarViewer3D({ isOpen, onClose, avatarUrl, username }: AvatarViewer3DProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{username}&apos;s Avatar</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <NextImage 
            src={getAvatarUrl(avatarUrl)} 
            alt={`${username}'s avatar`}
            width={320}
            height={320}
            className="w-80 h-80 rounded-full object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}