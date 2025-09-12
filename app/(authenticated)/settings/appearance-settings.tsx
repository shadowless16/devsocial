"use client";

import { useState } from "react";
import { Palette, Monitor, Sun, Moon, Type, Layout, Eye, Contrast, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppearance } from "@/contexts/appearance-context";
import { toast } from "@/hooks/use-toast";

type AppearanceSettings = {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  colorScheme: "default" | "blue" | "green" | "purple" | "orange";
  sidebarCollapsed: boolean;
  showAvatars: boolean;
};

export function AppearanceSettings() {
  const { settings, updateSettings, loading } = useAppearance();
  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = async (key: keyof typeof settings, value: any) => {
    setIsSaving(true);
    try {
      await updateSettings({ [key]: value });
      toast({
        title: "Settings updated",
        description: "Your appearance preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appearance settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Light theme with bright colors",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark theme with muted colors",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow your system preference",
      icon: Monitor,
    },
  ];

  const colorSchemes = [
    { value: "default", label: "Default", color: "bg-blue-500" },
    { value: "blue", label: "Blue", color: "bg-blue-600" },
    { value: "green", label: "Green", color: "bg-green-500" },
    { value: "purple", label: "Purple", color: "bg-purple-500" },
    { value: "orange", label: "Orange", color: "bg-orange-500" },
  ];

  const appearanceOptions = [
    {
      key: "compactMode" as keyof AppearanceSettings,
      label: "Compact Mode",
      description: "Reduce spacing and padding for a denser layout",
      icon: Layout,
      type: "boolean",
    },
    {
      key: "highContrast" as keyof AppearanceSettings,
      label: "High Contrast",
      description: "Increase contrast for better visibility",
      icon: Contrast,
      type: "boolean",
    },
    {
      key: "reducedMotion" as keyof AppearanceSettings,
      label: "Reduced Motion",
      description: "Minimize animations and transitions",
      icon: Eye,
      type: "boolean",
    },
    {
      key: "sidebarCollapsed" as keyof AppearanceSettings,
      label: "Collapsed Sidebar",
      description: "Start with sidebar collapsed by default",
      icon: Layout,
      type: "boolean",
    },
    {
      key: "showAvatars" as keyof AppearanceSettings,
      label: "Show Avatars",
      description: "Display user profile pictures throughout the app",
      icon: Eye,
      type: "boolean",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <Label className="text-sm font-medium">Theme</Label>
            <p className="text-xs text-gray-500">Choose your preferred color theme</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handlePreferenceChange("theme", theme.value)}
              disabled={isSaving}
              className={`p-4 rounded-lg border-2 transition-colors relative ${
                settings.theme === theme.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {settings.theme === theme.value && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <theme.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{theme.label}</div>
                  <div className="text-xs text-gray-500">{theme.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color Scheme */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <Label className="text-sm font-medium">Color Scheme</Label>
            <p className="text-xs text-gray-500">Choose your accent color</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => handlePreferenceChange("colorScheme", scheme.value)}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors relative ${
                settings.colorScheme === scheme.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {settings.colorScheme === scheme.value && (
                <Check className="w-3 h-3 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" />
              )}
              <div className={`w-4 h-4 rounded-full ${scheme.color}`}></div>
              <span className="text-sm">{scheme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Font Size */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Type className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <Label className="text-sm font-medium">Font Size</Label>
            <p className="text-xs text-gray-500">Adjust text size for better readability</p>
          </div>
        </div>
        
        <Select
          value={settings.fontSize}
          onValueChange={(value: "small" | "medium" | "large") =>
            handlePreferenceChange("fontSize", value)
          }
          disabled={isSaving}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">
              <div className="flex items-center space-x-2">
                <Type className="w-3 h-3" />
                <span>Small</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4" />
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="large">
              <div className="flex items-center space-x-2">
                <Type className="w-5 h-5" />
                <span>Large</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Display Options</h3>
        
        {appearanceOptions.map((option) => (
          <div key={option.key as string} className="flex items-center justify-between py-2">
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
              checked={settings[option.key] as boolean}
              onCheckedChange={(value) => handlePreferenceChange(option.key, value)}
              disabled={isSaving}
            />
          </div>
        ))}
      </div>

      {isSaving && (
        <div className="flex justify-center pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Saving preferences...</span>
          </div>
        </div>
      )}
    </div>
  );
}