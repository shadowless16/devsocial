"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'
import '@google/model-viewer'

interface AvatarViewer3DProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

export function AvatarViewer3D({ isOpen, onClose, avatarUrl, username }: AvatarViewer3DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const is3D = avatarUrl?.endsWith('.glb')

  if (!is3D) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{username}'s Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={avatarUrl} 
              alt={`${username}'s avatar`}
              className="w-80 h-80 rounded-full object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isFullscreen ? "max-w-[95vw] h-[95vh] p-0" : "max-w-4xl w-[95vw] h-[80vh] max-h-[90vh] p-0"}>
        <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
          <h2 className="text-sm sm:text-lg font-semibold text-white truncate">{username}'s 3D Avatar</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-black/50 text-white border-white/20 text-xs sm:text-sm flex-shrink-0 ml-2"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline ml-1">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </Button>
        </div>
        
        <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800">
          <model-viewer
            src={avatarUrl}
            alt="3D Avatar"
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}