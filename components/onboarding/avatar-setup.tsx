"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReadyPlayerMeAvatar } from "./ready-player-me-avatar"
import { useAuth } from "@/contexts/auth-context"

interface AvatarSetupProps {
  data: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function AvatarSetup({ data, onNext, onBack }: AvatarSetupProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    avatar: data.avatar || user?.avatar || "",
    bio: data.bio || "",
    gender: data.gender || "",
    userType: data.userType || "",
    socials: data.socials || { twitter: "", linkedin: "" },
  });

  // Set initial avatar from user context if available
  useEffect(() => {
    if (user?.avatar && !formData.avatar) {
      setFormData(prev => ({ ...prev, avatar: user.avatar }));
    }
  }, [user?.avatar, formData.avatar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarUrl }))
  }

  const handleGenderChange = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Let's set up your profile!</h3>
        <p className="text-gray-600">Upload an avatar and tell us about yourself</p>
      </div>

      {/* Ready Player Me Avatar */}
      <div className="space-y-4">
        <ReadyPlayerMeAvatar 
          onAvatarSelect={handleAvatarSelect}
          currentAvatar={formData.avatar}
        />
        
        {formData.avatar && (
          <div className="flex justify-center">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-2">
                <AvatarImage 
                  src={formData.avatar?.includes('models.readyplayer.me') && formData.avatar.endsWith('.glb') 
                    ? formData.avatar.replace('.glb', '.png') 
                    : formData.avatar || "/placeholder.svg"} 
                  alt="Avatar preview"
                />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-emerald-600 font-medium">✓ Avatar Selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Gender Selection */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={formData.gender} onValueChange={handleGenderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Selecting gender will generate a new avatar automatically
        </p>
      </div>

      {/* User Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="userType">I am a...</Label>
        <Select value={formData.userType} onValueChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us something cool about yourself! What are you passionate about?"
          value={formData.bio}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          className="min-h-[100px]"
          maxLength={250}
        />
        <p className="text-xs text-gray-500">{formData.bio.length}/250 characters</p>
      </div>

      {/* Social Links (Optional) */}
      <div className="space-y-4">
        <Label>Social Links (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="twitter" className="text-sm">
              Twitter Handle
            </Label>
            <Input
              id="twitter"
              placeholder="@yourusername"
              value={formData.socials.twitter}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, twitter: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="linkedin" className="text-sm">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/yourprofile"
              value={formData.socials.linkedin}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, linkedin: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 ml-auto">
          Continue
        </Button>
      </div>
    </form>
  )
}
