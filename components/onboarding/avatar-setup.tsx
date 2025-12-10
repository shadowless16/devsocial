"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/app-context"

import { toast } from "sonner"

export interface AvatarSetupData {
  avatar?: string;
  bio?: string;
  gender?: string;
  userType?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
  };
}

interface AvatarSetupProps {
  data: AvatarSetupData
  onNext: (data: AvatarSetupData) => void
  onChange?: (data: AvatarSetupData) => void
  onBack?: () => void
}

export function AvatarSetup({ data, onNext, onChange, onBack }: AvatarSetupProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    avatar: data.avatar || user?.avatar || "",
    bio: data.bio || "",
    gender: data.gender || "",
    userType: data.userType || "",
    socials: data.socials || { twitter: "", linkedin: "" },
  });
  const [isUploading, setIsUploading] = useState(false);

  // Update state when data prop changes (only on mount or when localStorage loads)
  useEffect(() => {
    if (data.avatar || data.bio || data.gender || data.userType || data.socials?.twitter || data.socials?.linkedin) {
      setFormData({
        avatar: data.avatar || user?.avatar || "",
        bio: data.bio || "",
        gender: data.gender || "",
        userType: data.userType || "",
        socials: data.socials || { twitter: "", linkedin: "" },
      })
    }
  }, [data.avatar, data.bio, data.gender, data.userType, data.socials, user?.avatar])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAvatarSelect = (avatarUrl: string) => {
    const next = { ...formData, avatar: avatarUrl }
    setFormData(next)
    onChange?.(next)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      const next = { ...formData, avatar: result.secure_url }
      setFormData(next);
      onChange?.(next)
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Upload failed:', errorMessage);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenderChange = (gender: string) => {
    const next = { ...formData, gender }
    setFormData(next)
    onChange?.(next)
  }

  // propagate social/bio/usertype changes
  // update handlers inline where they change state below

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Let&apos;s set up your profile!</h3>
        <p className="text-gray-600">Upload an avatar and tell us about yourself</p>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Upload your profile picture</p>
          
          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
        
        {formData.avatar && (
          <div className="flex justify-center">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-2">
                <AvatarImage 
                  src={formData.avatar} 
                  alt="Avatar preview"
                />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-emerald-600 font-medium">✓ Photo Selected</p>
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
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Selecting gender will generate a new avatar automatically
        </p>
      </div>

      {/* User Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="userType">I am a...</Label>
        <Select value={formData.userType} onValueChange={(value) => {
          const next = { ...formData, userType: value }
          setFormData(next)
          onChange?.(next)
        }}>
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
          onChange={(e) => {
            const next = { ...formData, bio: e.target.value }
            setFormData(next)
            onChange?.(next)
          }}
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
              onChange={(e) => {
                const next = { ...formData, socials: { ...formData.socials, twitter: e.target.value } }
                setFormData(next)
                onChange?.(next)
              }}
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
              onChange={(e) => {
                const next = { ...formData, socials: { ...formData.socials, linkedin: e.target.value } }
                setFormData(next)
                onChange?.(next)
              }}
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
        <Button 
          type="submit" 
          className="bg-emerald-600 hover:bg-emerald-700 ml-auto"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>
    </form>
  )
}
