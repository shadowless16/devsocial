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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
    <div className="space-y-12">
      {/* Mastery Grid */}
      <div className="grid grid-cols-2 gap-6">
        {skills.map((skill, index) => {
          const IconComponent = getSkillIcon(skill.name)
          return (
            <div
              key={index}
              className="group relative p-6 bg-white/5 border border-foreground/5 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                    <IconComponent 
                      className="text-indigo-600 dark:text-indigo-400 w-6 h-6"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground tracking-tighter">{skill.level}%</div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{skill.recentGain}%</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-foreground tracking-tight">{skill.name}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                    {getSkillLevel(skill.level)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-foreground/5 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(skill.level)}`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
                     <span>{skill.nextMilestone}</span>
                     <span>{skill.xpToNext} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Featured Learning Path - Extra Spacious */}
      <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
           <Target size={200} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Active Learning Path</h3>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Strategic Growth</p>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed max-w-[280px]">
            Consolidate your React expertise with 3 more project deployments to reach <span className="font-black underline decoration-2 underline-offset-4">Advanced Mastery</span>.
          </p>

          <div className="flex items-center space-x-4">
            <div className="px-6 py-2 bg-white text-indigo-600 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-xl">
              2 / 3 SYNCED
            </div>
            <span className="text-[10px] font-black text-white/50 tracking-[0.2em]">+150 XP BONUS</span>
          </div>
        </div>
      </div>
    </div>
  )
}