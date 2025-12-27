"use client"

import React from 'react'
// import Image from 'next/image';
import { Award, CheckCircle, ExternalLink, Code2, Users, Trophy, Zap, Bug, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Badge {
  name: string
  icon: string
  date: string
}

interface Mission {
  name: string
  completedTasks: number
  totalTasks: number
  xpEarned: number
  completionDate: string
}

interface Certification {
  name: string
  issuer: string
  issueDate: string
  logo: string
}

interface AchievementsData {
  badges: Badge[]
  missions: Mission[]
  certifications: Certification[]
}

interface AchievementShowcaseProps {
  achievements: AchievementsData
}

interface IconProps {
  size?: number
  className?: string
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  Code2,
  Users,
  Trophy,
  Zap,
  Bug,
  GraduationCap
}

export default function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  return (
    <div className="space-y-12">
      {/* Earned Badges - Asymmetric Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Insignias</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {achievements.badges.map((badge, index) => {
            const IconComponent = iconMap[badge.icon] || Trophy
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-white/5 border border-foreground/5 rounded-3xl hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-inner ring-4 ring-indigo-500/5">
                  <IconComponent size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-foreground text-center">
                  {badge.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1 opacity-50">
                  {badge.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Completed Missions */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Operations</h3>
          <div className="space-y-4">
            {achievements.missions.map((mission, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-foreground/5 group"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
                  <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">{mission.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mission.completedTasks} tasks • {mission.xpEarned} XP
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-wider">SUCCESS</div>
                  <div className="text-[10px] text-muted-foreground opacity-50 uppercase font-bold">{mission.completionDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Certifications */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Credentials</h3>
          <div className="space-y-4">
            {achievements.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-foreground/5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all ring-1 ring-foreground/10">
                  <img
                    src={cert.logo}
                    alt={cert.issuer}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">{cert.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cert.issuer}
                  </p>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-muted-foreground opacity-50 uppercase font-bold">{cert.issueDate}</div>
                   <ExternalLink size={14} className="text-muted-foreground ml-auto group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}