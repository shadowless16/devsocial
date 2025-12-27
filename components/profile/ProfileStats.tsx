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
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {statItems.map((item, index) => (
          <div 
            key={index} 
            className="group relative"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </div>
              
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-foreground tracking-tighter">
                  {item.value}
                </span>
                {item.suffix && (
                  <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>
                    {item.suffix}
                  </span>
                )}
              </div>

              {/* Decorative underlying line */}
              <div className="w-full h-px bg-foreground/5 relative overflow-hidden">
                <div className={`absolute inset-0 w-0 group-hover:w-full transition-all duration-1000 ease-out ${item.color.replace('text-', 'bg-')}/30`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}