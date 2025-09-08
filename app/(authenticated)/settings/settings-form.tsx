// app/(authenticated)/settings/settings-form.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useAuth, User } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Save, Upload, User as UserIcon, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const WalletConnect = dynamic(() => import('@/components/wallet-connect').then(mod => mod.WalletConnect), {
  loading: () => <p>Loading WalletConnect...</p>,
  ssr: false
});

type ProfileFormData = Pick<
  User,
  | "displayName"
  | "username"
  | "email"
  | "bio"
  | "affiliation"
  | "location"
  | "website"
  | "avatar"
>;

interface SettingsFormProps {
  initialUser: User;
  affiliations: string[];
}

interface UpdateProfileResponse {
    user: User;
}

export function SettingsForm({ initialUser, affiliations }: SettingsFormProps) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: initialUser.displayName || initialUser.username,
    username: initialUser.username,
    email: initialUser.email,
    bio: initialUser.bio || "",
    affiliation: initialUser.affiliation || "Other",
    location: initialUser.location || "",
    website: initialUser.website || "",
    avatar: initialUser.avatar || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || user.username,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        affiliation: user.affiliation || "Other",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    
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
      setFormData(prev => ({ ...prev, avatar: result.secure_url }));
      setSuccess('Profile picture uploaded successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) {
      setError("Form data is not available. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        displayName: formData.displayName,
        bio: formData.bio,
        affiliation: formData.affiliation,
        location: formData.location,
        website: formData.website,
      };

      const response = await apiClient.updateProfile<UpdateProfileResponse>(payload);

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess("Profile updated successfully!");
      } else {
        throw new Error(response.message || "An unknown error occurred while saving.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
          <TabsTrigger value="privacy" disabled>Privacy</TabsTrigger>
          <TabsTrigger value="appearance" disabled>Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>{formData.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-600">
                        Upload a new profile picture or create an avatar.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload New'}
                      </Button>
                    </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={formData.displayName} onChange={(e) => handleInputChange("displayName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={formData.username} disabled />
                  <p className="text-xs text-gray-500">Username cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled />
                  <p className="text-xs text-gray-500">Email cannot be changed after verification.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Select 
                    value={formData.affiliation} 
                    onValueChange={(value) => handleInputChange("affiliation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select affiliation" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {affiliations.map((affiliation) => (
                        <SelectItem key={affiliation} value={affiliation}>
                          {affiliation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location || ""} onChange={(e) => handleInputChange("location", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" value={formData.website || ""} onChange={(e) => handleInputChange("website", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} className="min-h-[100px]" maxLength={250} />
                <p className="text-xs text-gray-500 text-right">{formData.bio?.length || 0}/250 characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6 mt-6">
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end items-center mt-8 space-x-4">
        {success && <p className="text-sm text-green-600">{success}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </>
  );
}
