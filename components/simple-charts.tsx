"use client"

import { useEffect, useState } from 'react'

interface ActivityChartProps {
  data: Array<{
    date: string
    xp: number
    activities: number
  }>
}

interface XPChartProps {
  data: Array<{
    name: string
    value: number
    count: number
  }>
}

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]

export function ActivityChart({ data }: ActivityChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[200px] flex items-center justify-center">Loading...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        <p>No activity data available</p>
      </div>
    )
  }

  const maxXP = Math.max(...data.map(d => d.xp))
  const maxActivities = Math.max(...data.map(d => d.activities))

  return (
    <div className="w-full h-[200px] p-4">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex flex-col items-center justify-end h-32 space-y-1">
              <div 
                className="w-4 bg-green-500 rounded-t"
                style={{ height: `${(item.xp / maxXP) * 100}%` }}
                title={`${item.xp} XP`}
              />
              <div 
                className="w-4 bg-blue-500 rounded-t"
                style={{ height: `${(item.activities / maxActivities) * 80}%` }}
                title={`${item.activities} activities`}
              />
            </div>
            <span className="text-xs text-gray-600 mt-2">{item.date}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-xs">XP</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs">Activities</span>
        </div>
      </div>
    </div>
  )
}

export function XPChart({ data }: XPChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[180px] flex items-center justify-center">Loading...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-gray-500">
        <p>No XP data available</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full h-[180px] p-2 overflow-hidden">
      <div className="flex items-center justify-center h-20">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0)
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 2.51} 251.2`}
                  strokeDashoffset={-strokeDashoffset * 2.51}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 mt-4 max-w-full">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center space-x-2 min-w-0">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600 truncate">
              {entry.name.length > 15 ? entry.name.substring(0, 15) + '...' : entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}