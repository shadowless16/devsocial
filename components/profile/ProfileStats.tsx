"use client"

import React from 'react'
import { Zap, Target, Trophy, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsData {
  totalXP: number
  challengesCompleted: number
  communityRank: number
  postsCreated: number
}

interface ProfileStatsProps {
  stats: StatsData
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: 'Total XP',
      value: (stats?.totalXP || 0).toLocaleString(),
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      suffix: 'XP'
    },
    {
      label: 'Challenges Completed',
      value: stats?.challengesCompleted || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: ''
    },
    {
      label: 'Community Rank',
      value: `#${stats?.communityRank || 999}`,
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      suffix: ''
    },
    {
      label: 'Posts Created',
      value: stats?.postsCreated || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      suffix: ''
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statItems.map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <div className={`w-5 h-5 ${item.bgColor} rounded-md flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon size={10} className={item.color} />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  {item.value}
                  {item.suffix && (
                    <span className={`text-xs font-medium ml-0.5 ${item.color}`}>
                      {item.suffix}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium truncate">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}