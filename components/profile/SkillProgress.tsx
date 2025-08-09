"use client"

import React from 'react'
import { TrendingUp, Target, Code2, Server, Database, Cloud, Package, FileCode, Code, Atom } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Skill {
  name: string
  level: number
  projectsCompleted: number
  recentGain: number
  nextMilestone: string
  xpToNext: number
}

interface SkillProgressProps {
  skills: Skill[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'JavaScript': Code2,
  'React': Atom,
  'Node.js': Server,
  'Python': FileCode,
  'TypeScript': Code,
  'AWS': Cloud,
  'Docker': Package,
  'MongoDB': Database
}

export default function SkillProgress({ skills }: SkillProgressProps) {
  const getSkillIcon = (skill: string) => {
    return iconMap[skill] || Code2
  }

  const getProgressColor = (level: number) => {
    if (level >= 90) return 'bg-green-600'
    if (level >= 70) return 'bg-blue-600'
    if (level >= 50) return 'bg-yellow-600'
    return 'bg-gray-600'
  }

  const getSkillLevel = (level: number) => {
    if (level >= 90) return 'Expert'
    if (level >= 70) return 'Advanced'
    if (level >= 50) return 'Intermediate'
    return 'Beginner'
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Skill Progression</h2>
          <TrendingUp size={20} className="text-primary" />
        </div>

        <div className="space-y-4">
          {skills.map((skill, index) => {
            const IconComponent = getSkillIcon(skill.name)
            return (
              <div
                key={index}
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent 
                        size={16} 
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{skill.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {getSkillLevel(skill.level)} • {skill.projectsCompleted} projects
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{skill.level}%</div>
                    <div className="text-xs text-muted-foreground">+{skill.recentGain} this month</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(skill.level)}`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Next milestone: {skill.nextMilestone}</span>
                  <span>{skill.xpToNext} XP to go</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-blue-600" />
            <h3 className="text-sm font-medium text-foreground">Skill Goals</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Complete 3 more React projects to reach Advanced level
          </p>
          <div className="flex gap-2">
            <Badge className="bg-blue-600 text-white text-xs">
              2/3 completed
            </Badge>
            <Badge variant="secondary" className="text-xs">
              +150 XP reward
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}