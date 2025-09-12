"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { apiClient } from "@/lib/api-client";

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  colorScheme: "default" | "blue" | "green" | "purple" | "orange";
  sidebarCollapsed: boolean;
  showAvatars: boolean;
}

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>;
  loading: boolean;
  applyTheme: () => void;
}

const defaultSettings: AppearanceSettings = {
  theme: "system",
  fontSize: "medium",
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  colorScheme: "default",
  sidebarCollapsed: false,
  showAvatars: true,
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings when user is available
  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Apply theme changes to document
  useEffect(() => {
    applyTheme();
  }, [settings.theme, settings.fontSize, settings.compactMode, settings.highContrast, settings.colorScheme]);

  const loadSettings = async () => {
    try {
      const response = await apiClient.request("/users/appearance-settings");
      if (response.success && response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.error("Failed to load appearance settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await apiClient.request("/users/appearance-settings", {
        method: "PUT",
        body: JSON.stringify(updatedSettings),
      });
    } catch (error) {
      console.error("Failed to save appearance settings:", error);
      // Revert on error
      setSettings(settings);
      throw error;
    }
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", settings.theme === "dark");
    }

    // Apply font size
    root.classList.remove("text-sm", "text-base", "text-lg");
    switch (settings.fontSize) {
      case "small":
        root.classList.add("text-sm");
        break;
      case "large":
        root.classList.add("text-lg");
        break;
      default:
        root.classList.add("text-base");
    }

    // Apply compact mode
    root.classList.toggle("compact-mode", settings.compactMode);

    // Apply high contrast
    root.classList.toggle("high-contrast", settings.highContrast);

    // Apply color scheme
    root.classList.remove("theme-default", "theme-blue", "theme-green", "theme-purple", "theme-orange");
    root.classList.add(`theme-${settings.colorScheme}`);

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s");
      root.style.setProperty("--transition-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
    }
  };

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings, loading, applyTheme }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}