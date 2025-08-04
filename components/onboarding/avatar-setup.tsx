"use client"

import type React from "react"

import { useState } from "react"
import { Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarSetupProps {
  data: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function AvatarSetup({ data, onNext, onBack }: AvatarSetupProps) {
  const [formData, setFormData] = useState({
    avatar: data.avatar || "",
    bio: data.bio || "",
    socials: data.socials || { twitter: "", linkedin: "" },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement UploadThing integration
      const mockUrl = URL.createObjectURL(file)
      setFormData((prev) => ({ ...prev, avatar: mockUrl }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Let's set up your profile!</h3>
        <p className="text-gray-600">Upload an avatar and tell us about yourself</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={formData.avatar || "/placeholder.svg"} />
          <AvatarFallback>
            <User className="w-12 h-12 text-gray-400" />
          </AvatarFallback>
        </Avatar>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button type="button" variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Upload className="w-4 h-4" />
            <span>Upload Avatar</span>
          </Button>
        </div>
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
