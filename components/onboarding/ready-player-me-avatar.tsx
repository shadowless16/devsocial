"use client"

import React, { useState } from 'react'
import {
  AvatarCreator,
  AvatarCreatorConfig,
  AvatarExportedEvent,
} from '@readyplayerme/react-avatar-creator'
import { Button } from '@/components/ui/button'
import { RefreshCw, User } from 'lucide-react'

interface ReadyPlayerMeAvatarProps {
  onAvatarSelect: (avatarUrl: string) => void
  currentAvatar?: string
}

const subdomain = 'devsocial' // Using demo subdomain to avoid account requirements

export function ReadyPlayerMeAvatar({ onAvatarSelect, currentAvatar }: ReadyPlayerMeAvatarProps) {
  const [mode, setMode] = useState<'random' | 'custom' | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  const config: AvatarCreatorConfig & { skipIntro?: boolean; skipOnboarding?: boolean } = {
    clearCache: false,
    bodyType: 'halfbody',
    quickStart: true,
    language: 'en',
    skipIntro: false,
    skipOnboarding: true
  }

  const handleAvatarExported = (event: AvatarExportedEvent) => {
    const avatarUrl = event.data.url
    console.log('Avatar URL:', avatarUrl)
    
    // Ask user preference: 3D or 2D
    const use3D = confirm('Use 3D avatar? Click OK for 3D, Cancel for 2D image')
    
    if (use3D) {
      onAvatarSelect(avatarUrl) // Keep .glb for 3D
    } else {
      const imageUrl = avatarUrl.replace('.glb', '.png')
      onAvatarSelect(imageUrl) // Use .png for 2D
    }
  }

  const onRandomize = () => {
    setMode('random')
    setIframeKey((k) => k + 1) // Force reload
  }

  const onCustomize = () => {
    setMode('custom')
    setIframeKey((k) => k + 1) // Force reload
  }

  const getIframeConfig = (): AvatarCreatorConfig => {
    return {
      ...config,
      quickStart: mode === 'random'
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium mb-2">Create Your Avatar</h4>
        <p className="text-sm text-gray-600">Choose random or customize your 3D avatar</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
        <Button
          type="button"
          onClick={onRandomize}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Skip & Random Avatar</span>
        </Button>
        <Button
          type="button"
          onClick={onCustomize}
          variant="default"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
        >
          <User className="w-4 h-4" />
          <span>Create My Own</span>
        </Button>
      </div>

      {mode && (
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <AvatarCreator
            key={iframeKey}
            subdomain={subdomain}
            config={getIframeConfig()}
            style={{ 
              width: '100%', 
              height: '500px', 
              border: 'none',
              minHeight: '400px'
            }}
            onAvatarExported={handleAvatarExported}
          />
        </div>
      )}

      {!mode && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Choose an option above to start creating your avatar</p>
        </div>
      )}
    </div>
  )
}