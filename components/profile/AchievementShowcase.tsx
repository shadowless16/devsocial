"use client"

import React from 'react'
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

const iconMap: Record<string, React.ComponentType<any>> = {
  Code2,
  Users,
  Trophy,
  Zap,
  Bug,
  GraduationCap
}

export default function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
          <Award size={16} className="text-primary" />
        </div>

        {/* Earned Badges */}
        <div className="mb-3">
          <h3 className="text-xs font-medium text-foreground mb-1.5">Earned Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {achievements.badges.map((badge, index) => {
              const IconComponent = iconMap[badge.icon] || Trophy
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <IconComponent size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">
                    {badge.name}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {badge.date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completed Missions */}
        <div className="mb-3">
          <h3 className="text-xs font-medium text-foreground mb-1.5">Completed Mission Series</h3>
          <div className="space-y-1.5">
            {achievements.missions.map((mission, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 p-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="w-5 h-5 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle size={10} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-foreground">{mission.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Completed {mission.completedTasks}/{mission.totalTasks} tasks • {mission.xpEarned} XP
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-green-600">100%</div>
                  <div className="text-xs text-muted-foreground">{mission.completionDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Certifications */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-1.5">Skill Certifications</h3>
          <div className="grid grid-cols-1 gap-1.5">
            {achievements.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 p-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={cert.logo}
                    alt={cert.issuer}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-foreground">{cert.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {cert.issuer} • {cert.issueDate}
                  </p>
                </div>
                <ExternalLink size={12} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}