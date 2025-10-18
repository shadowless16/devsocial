"use client"

import { SmartAvatar } from "@/components/ui/smart-avatar"

export function AvatarShowcase() {
  const examples = [
    { username: "Amanda", level: 1, label: "Level 1 - Gray Frame" },
    { username: "Jaikit", level: 5, label: "Level 5 - Green Frame" },
    { username: "Tosinworks", level: 15, label: "Level 15 - Blue Frame" },
    { username: "Ayosholami", level: 30, label: "Level 30 - Gold Frame (Animated)" },
    { username: "SamuelCodes", level: 50, label: "Level 50 - Purple Frame + Star" },
  ]

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        New Avatar System Showcase
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {examples.map((example) => (
          <div key={example.username} className="flex flex-col items-center gap-3">
            <SmartAvatar
              username={example.username}
              level={example.level}
              alt={example.username}
              className="w-20 h-20"
              showLevelFrame={true}
            />
            <div className="text-center">
              <p className="font-semibold">@{example.username}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {example.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-bold mb-2">✨ Features:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ Unique illustrated avatars for every user</li>
          <li>✅ Level-based colored frames</li>
          <li>✅ 50 XP reward for uploading custom photo</li>
          <li>✅ "First Impression" badge</li>
          <li>✅ Animated effects for high-level users</li>
        </ul>
      </div>
    </div>
  )
}
