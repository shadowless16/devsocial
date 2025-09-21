"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Heart, UserPlus, Trophy, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/app-context";
import { apiClient } from "@/lib/api-client";

interface NotificationPreferences {
  email: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    achievements: boolean;
    weeklyDigest: boolean;
  };
  push: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    achievements: boolean;
    directMessages: boolean;
  };
  inApp: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    achievements: boolean;
    directMessages: boolean;
    system: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    likes: false,
    comments: true,
    follows: true,
    mentions: true,
    achievements: true,
    weeklyDigest: true,
  },
  push: {
    likes: false,
    comments: true,
    follows: true,
    mentions: true,
    achievements: true,
    directMessages: true,
  },
  inApp: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    achievements: true,
    directMessages: true,
    system: true,
  },
};

export function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load user's notification preferences
    const loadPreferences = async () => {
      try {
        const response = await apiClient.request("/notifications/preferences");
        if (response.success && response.data) {
          setPreferences({ ...defaultPreferences, ...response.data });
        }
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handlePreferenceChange = (
    category: keyof NotificationPreferences,
    type: string,
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.request("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      if (response.success) {
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: "likes",
      label: "Likes",
      description: "When someone likes your posts or comments",
      icon: Heart,
    },
    {
      key: "comments",
      label: "Comments",
      description: "When someone comments on your posts",
      icon: MessageSquare,
    },
    {
      key: "follows",
      label: "New Followers",
      description: "When someone follows you",
      icon: UserPlus,
    },
    {
      key: "mentions",
      label: "Mentions",
      description: "When someone mentions you in a post or comment",
      icon: Bell,
    },
    {
      key: "achievements",
      label: "Achievements",
      description: "When you earn badges or level up",
      icon: Trophy,
    },
  ];

  const additionalTypes = [
    {
      key: "directMessages",
      label: "Direct Messages",
      description: "When you receive a private message",
      icon: Mail,
      categories: ["push", "inApp"],
    },
    {
      key: "weeklyDigest",
      label: "Weekly Digest",
      description: "Weekly summary of your activity and highlights",
      icon: Zap,
      categories: ["email"],
    },
    {
      key: "system",
      label: "System Notifications",
      description: "Important updates and announcements",
      icon: Bell,
      categories: ["inApp"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main notification types */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
          <div></div>
          <div className="text-center">Email</div>
          <div className="text-center">Push</div>
          <div className="text-center">In-App</div>
        </div>

        {notificationTypes.map((type) => (
          <div key={type.key} className="grid grid-cols-4 gap-4 items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <type.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">{type.label}</Label>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Switch
                checked={preferences.email[type.key as keyof typeof preferences.email]}
                onCheckedChange={(value) =>
                  handlePreferenceChange("email", type.key, value)
                }
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={preferences.push[type.key as keyof typeof preferences.push]}
                onCheckedChange={(value) =>
                  handlePreferenceChange("push", type.key, value)
                }
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={preferences.inApp[type.key as keyof typeof preferences.inApp]}
                onCheckedChange={(value) =>
                  handlePreferenceChange("inApp", type.key, value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Additional notification types */}
      <div className="space-y-4">
        {additionalTypes.map((type) => (
          <div key={type.key} className="grid grid-cols-4 gap-4 items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <type.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">{type.label}</Label>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </div>
            <div className="flex justify-center">
              {type.categories.includes("email") ? (
                <Switch
                  checked={preferences.email[type.key as keyof typeof preferences.email]}
                  onCheckedChange={(value) =>
                    handlePreferenceChange("email", type.key, value)
                  }
                />
              ) : (
                <div className="w-10 h-6 bg-gray-100 rounded-full opacity-50"></div>
              )}
            </div>
            <div className="flex justify-center">
              {type.categories.includes("push") ? (
                <Switch
                  checked={preferences.push[type.key as keyof typeof preferences.push]}
                  onCheckedChange={(value) =>
                    handlePreferenceChange("push", type.key, value)
                  }
                />
              ) : (
                <div className="w-10 h-6 bg-gray-100 rounded-full opacity-50"></div>
              )}
            </div>
            <div className="flex justify-center">
              {type.categories.includes("inApp") ? (
                <Switch
                  checked={preferences.inApp[type.key as keyof typeof preferences.inApp]}
                  onCheckedChange={(value) =>
                    handlePreferenceChange("inApp", type.key, value)
                  }
                />
              ) : (
                <div className="w-10 h-6 bg-gray-100 rounded-full opacity-50"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}