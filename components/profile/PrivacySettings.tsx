"use client"

import React, { useState } from 'react'
import { Shield, Eye, Mail, MapPin, Activity, MessageCircle, BarChart3, Download, Archive, Trash2, Save, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface PrivacySettingsData {
  profileVisibility: boolean
  showEmail: boolean
  showLocation: boolean
  showActivity: boolean
  allowMessages: boolean
  showStats: boolean
}

interface PrivacySettingsProps {
  settings: PrivacySettingsData
  onSettingsChange: (settings: PrivacySettingsData) => void
}

export default function PrivacySettings({ settings, onSettingsChange }: PrivacySettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: keyof PrivacySettingsData, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const privacyOptions = [
    {
      key: 'profileVisibility' as keyof PrivacySettingsData,
      label: 'Public Profile',
      description: 'Allow others to view your profile and activity',
      icon: Eye
    },
    {
      key: 'showEmail' as keyof PrivacySettingsData,
      label: 'Show Email Address',
      description: 'Display your email on your public profile',
      icon: Mail
    },
    {
      key: 'showLocation' as keyof PrivacySettingsData,
      label: 'Show Location',
      description: 'Display your location on your profile',
      icon: MapPin
    },
    {
      key: 'showActivity' as keyof PrivacySettingsData,
      label: 'Show Recent Activity',
      description: 'Allow others to see your recent posts and interactions',
      icon: Activity
    },
    {
      key: 'allowMessages' as keyof PrivacySettingsData,
      label: 'Allow Direct Messages',
      description: 'Let other users send you private messages',
      icon: MessageCircle
    },
    {
      key: 'showStats' as keyof PrivacySettingsData,
      label: 'Show Statistics',
      description: 'Display your XP, rank, and achievement stats',
      icon: BarChart3
    }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
          <Shield size={20} className="text-primary" />
        </div>

        <div className="space-y-4 mb-6">
          {privacyOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <option.icon size={16} className="text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{option.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </div>
                  
                  <Switch
                    checked={localSettings[option.key]}
                    onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Management */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Data Management</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Download size={16} className="mr-2" />
              Download My Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Archive size={16} className="mr-2" />
              Archive Account
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

        {/* Save/Reset Buttons */}
        {hasChanges && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw size={16} className="mr-2" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}