"use client"

import { useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface RPMAvatarModalProps {
  isOpen: boolean
  onClose: () => void
  onAvatarExported: (avatarUrl: string) => void
}

export function RPMAvatarModal({ isOpen, onClose, onAvatarExported }: RPMAvatarModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function receiveMessage(event: MessageEvent) {
      if (event.data?.source !== 'readyplayerme') return

      if (event.data.eventName === 'v1.avatar.exported') {
        console.log('Avatar URL:', event.data.data.url)
        onAvatarExported(event.data.data.url)
        onClose()
      }
    }

    window.addEventListener('message', receiveMessage)
    return () => window.removeEventListener('message', receiveMessage)
  }, [onClose, onAvatarExported])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Your 3D Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 h-full">
          <iframe
            ref={iframeRef}
            src="https://devsocial.readyplayer.me/avatar?frameApi"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="camera *; microphone *"
            title="Ready Player Me Avatar Creator"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}