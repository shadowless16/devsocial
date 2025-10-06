// app/(authenticated)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
// FIX 1: Import the 'User' type directly from the context file.
import { useAuth } from "@/contexts/app-context";
import type { User } from "@/contexts/app-context";
import { apiClient } from "@/lib/api-client";
import { Settings, Save, Upload, User as UserIcon, Bell, Shield, Palette } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import dynamic from 'next/dynamic';
import { NotificationSettings } from "./notification-settings";
import { PrivacySettings } from "./privacy-settings";
import { AppearanceSettings } from "./appearance-settings";

const WalletConnect = dynamic(() => import('@/components/wallet-connect').then(mod => mod.WalletConnect), {
  loading: () => <p>Loading WalletConnect...</p>,
  ssr: false
});

// Use the imported 'User' type here.
type ProfileFormData = Pick<
  User,
  | "firstName"
  | "lastName"
  | "displayName"
  | "username"
  | "email"
  | "bio"
  | "affiliation"
  | "location"
  | "website"
  | "avatar"
>;

interface AffiliationsData {
  affiliations: {
    techBootcamps?: string[];
    federal?: string[];
    state?: string[];
    privateUniversities?: string[];
    affiliatedInstitutions?: string[];
    distanceLearning?: string[];
  };
}

interface UpdateProfileResponse {
    user: User;
}

export default function SettingsPage() {
  const { user, loading: authLoading, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [loadingAffiliations, setLoadingAffiliations] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Debug logging
  console.log('[Settings Debug]', {
    authLoading,
    user: user ? { username: user.username, email: user.email } : null,
    formData: formData ? 'has data' : 'null'
  });

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[Settings] Loading timeout - forcing render');
      setLoadingTimeout(true);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('[Settings] User effect triggered:', { user, authLoading });
    if (user) {
      console.log('[Settings] Setting form data with user:', user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
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

  useEffect(() => {
    const fetchAffiliations = async () => {
      try {
        const response = await apiClient.request<AffiliationsData>("/affiliations");
        if (response.success && response.data?.affiliations) {
          // Combine all affiliations from different categories
          const allAffiliations = [
            ...(response.data.affiliations.techBootcamps || []),
            ...(response.data.affiliations.federal || []),
            ...(response.data.affiliations.state || []),
            ...(response.data.affiliations.privateUniversities || []),
            ...(response.data.affiliations.affiliatedInstitutions || []),
            ...(response.data.affiliations.distanceLearning || [])
          ];
          // Remove duplicates and sort
          const uniqueAffiliations = [...new Set(allAffiliations)].sort();
          setAffiliations(uniqueAffiliations);
        }
      } catch (error) {
        console.error("Failed to fetch affiliations:", error);
        // Fallback to default affiliations
        setAffiliations(["NIIT Lagos", "NIIT Yaba", "NIIT Abuja", "NIIT Port Harcourt", "NIIT Kano", "Other"]);
      } finally {
        setLoadingAffiliations(false);
      }
    };
    fetchAffiliations();
  }, []);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        setFormData((prev) => (prev ? { ...prev, avatar: data.url } : null));
        setSuccess('Avatar uploaded successfully!');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

   const handleSave = async () => {
    // This guard clause is essential. It stops if formData is null.
    if (!formData) {
      setError("Form data is not available. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        bio: formData.bio,
        affiliation: formData.affiliation,
        location: formData.location,
        website: formData.website,
        avatar: formData.avatar,
      };

      // We pass the 'payload' object to the API client.
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


  // Show loading only if still loading and timeout hasn't been reached
  if ((authLoading || !formData) && !loadingTimeout) {
    return <SettingsSkeleton />
  }

  // If timeout reached but still no data, show error
  if (loadingTimeout && (!user || !formData)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">Unable to load settings</p>
          <p className="text-sm text-gray-500 mt-2">There seems to be an authentication issue.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 lg:py-6 px-4">
      {/* ... The rest of your JSX code for the form remains the same ... */}
       <div className="text-center mb-8">
        <div className="inline-block bg-gray-200 p-3 rounded-full">
            <Settings className="w-8 h-8 text-gray-700" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
              {formData && (
              <>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>{formData.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-600">
                        Upload a profile picture (max 5MB)
                    </p>
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" size="sm" disabled={uploadingAvatar} asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload New'}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formData.firstName || ""} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formData.lastName || ""} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Enter your last name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={formData.displayName} onChange={(e) => handleInputChange("displayName", e.target.value)} placeholder="How you want to be called" />
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
                    disabled={loadingAffiliations}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingAffiliations ? "Loading..." : "Select affiliation"} />
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
                <p className="text-xs text-gray-500 text-right">{formData.bio.length}/250 characters</p>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6 mt-6">
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrivacySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Appearance & Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppearanceSettings />
            </CardContent>
          </Card>
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
    </div>
  );
}