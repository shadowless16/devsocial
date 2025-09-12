"use client"

import { useState } from "react"

interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  fontSize: "small" | "medium" | "large"
  compactMode: boolean
}

export default function AppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: "system",
    fontSize: "medium",
    compactMode: false,
  })

  const handleThemeChange = (theme: AppearanceSettings["theme"]) => {
    setSettings(prev => ({ ...prev, theme }))
  }

  const handleFontSizeChange = (fontSize: AppearanceSettings["fontSize"]) => {
    setSettings(prev => ({ ...prev, fontSize }))
  }

  const handleCompactModeToggle = () => {
    setSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Theme</h3>
        <div className="space-y-2">
          {(["light", "dark", "system"] as const).map((theme) => (
            <label key={theme} className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={settings.theme === theme}
                onChange={() => handleThemeChange(theme)}
                className="w-4 h-4"
              />
              <span className="capitalize">{theme}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Font Size</h3>
        <div className="space-y-2">
          {(["small", "medium", "large"] as const).map((size) => (
            <label key={size} className="flex items-center space-x-2">
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={settings.fontSize === size}
                onChange={() => handleFontSizeChange(size)}
                className="w-4 h-4"
              />
              <span className="capitalize">{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.compactMode}
            onChange={handleCompactModeToggle}
            className="w-4 h-4"
          />
          <span>Compact mode</span>
        </label>
      </div>
    </div>
  )
}