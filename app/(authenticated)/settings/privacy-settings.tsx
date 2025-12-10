"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, Mail, MapPin, Activity, MessageCircle, BarChart3, Download, Archive, Trash2, Lock, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/app-context";
import { apiClient } from "@/lib/api/api-client";

interface PrivacyPreferences {
  profileVisibility: "public" | "followers" | "private";
  showEmail: boolean;
  showLocation: boolean;
  showActivity: boolean;
  showStats: boolean;
  allowMessages: "everyone" | "followers" | "none";
  allowMentions: "everyone" | "followers" | "none";
  showOnlineStatus: boolean;
  indexProfile: boolean;
}

const defaultPreferences: PrivacyPreferences = {
  profileVisibility: "public",
  showEmail: false,
  showLocation: true,
  showActivity: true,
  showStats: true,
  allowMessages: "followers",
  allowMentions: "everyone",
  showOnlineStatus: true,
  indexProfile: true,
};

export function PrivacySettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PrivacyPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load user's privacy preferences
    const loadPreferences = async () => {
      try {
        const response = await apiClient.request("/users/privacy-settings");
        if (response.success && response.data) {
          setPreferences({ ...defaultPreferences, ...response.data });
        }
      } catch (error: unknown) {
        console.error("Failed to load privacy preferences:", error);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handlePreferenceChange = (key: keyof PrivacyPreferences, value: unknown) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.request("/users/privacy-settings", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      if (response.success) {
        setHasChanges(false);
      }
    } catch (error: unknown) {
      console.error("Failed to save privacy preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await apiClient.request("/users/export-data", {
        method: "POST",
      });
      if (response.success) {
        // Handle download or show success message
        alert("Data export request submitted. You'll receive an email with your data within 24 hours.");
      }
    } catch (error: unknown) {
      console.error("Failed to request data export:", error);
    }
  };

  const privacyOptions = [
    {
      key: "showEmail" as keyof PrivacyPreferences,
      label: "Show Email Address",
      description: "Display your email on your public profile",
      icon: Mail,
      type: "boolean",
    },
    {
      key: "showLocation" as keyof PrivacyPreferences,
      label: "Show Location",
      description: "Display your location on your profile",
      icon: MapPin,
      type: "boolean",
    },
    {
      key: "showActivity" as keyof PrivacyPreferences,
      label: "Show Recent Activity",
      description: "Allow others to see your recent posts and interactions",
      icon: Activity,
      type: "boolean",
    },
    {
      key: "showStats" as keyof PrivacyPreferences,
      label: "Show Statistics",
      description: "Display your XP, rank, and achievement stats",
      icon: BarChart3,
      type: "boolean",
    },
    {
      key: "showOnlineStatus" as keyof PrivacyPreferences,
      label: "Show Online Status",
      description: "Let others see when you're online",
      icon: Eye,
      type: "boolean",
    },
    {
      key: "indexProfile" as keyof PrivacyPreferences,
      label: "Search Engine Indexing",
      description: "Allow search engines to index your profile",
      icon: Globe,
      type: "boolean",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <Label className="text-sm font-medium">Profile Visibility</Label>
            <p className="text-xs text-gray-500">Who can see your profile and posts</p>
          </div>
        </div>
        <Select
          value={preferences.profileVisibility}
          onValueChange={(value: "public" | "followers" | "private") =>
            handlePreferenceChange("profileVisibility", value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-xs text-gray-500">Anyone can see your profile</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="followers">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <div>
                  <div className="font-medium">Followers Only</div>
                  <div className="text-xs text-gray-500">Only your followers can see your profile</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="private">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <div>
                  <div className="font-medium">Private</div>
                  <div className="text-xs text-gray-500">Only you can see your profile</div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Communication Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Communication</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">Direct Messages</Label>
                <p className="text-xs text-gray-500">Who can send you private messages</p>
              </div>
            </div>
            <Select
              value={preferences.allowMessages}
              onValueChange={(value: "everyone" | "followers" | "none") =>
                handlePreferenceChange("allowMessages", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">Mentions</Label>
                <p className="text-xs text-gray-500">Who can mention you in posts</p>
              </div>
            </div>
            <Select
              value={preferences.allowMentions}
              onValueChange={(value: "everyone" | "followers" | "none") =>
                handlePreferenceChange("allowMentions", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Profile Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Profile Information</h3>
        
        {privacyOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <option.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">{option.label}</Label>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
            <Switch
              checked={preferences[option.key] as boolean}
              onCheckedChange={(value) => handlePreferenceChange(option.key, value)}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Data Management */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Data Management</h3>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleDataExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive Account (Coming Soon)
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            disabled
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account (Coming Soon)
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}