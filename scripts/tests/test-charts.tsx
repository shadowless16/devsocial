"use client"

import { ActivityChart, XPChart } from '../../components/dashboard-charts'

// Test data
const testActivityData = [
  { date: 'Jan 1', xp: 50, activities: 3 },
  { date: 'Jan 2', xp: 75, activities: 5 },
  { date: 'Jan 3', xp: 30, activities: 2 },
  { date: 'Jan 4', xp: 90, activities: 6 },
  { date: 'Jan 5', xp: 60, activities: 4 }
]

const testXPData = [
  { name: 'POST CREATION', value: 200, count: 10 },
  { name: 'LIKE GIVEN', value: 50, count: 10 },
  { name: 'COMMENT POSTED', value: 75, count: 15 },
  { name: 'DAILY LOGIN', value: 35, count: 7 }
]

export default function TestCharts() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Activity Chart Test</h2>
        <div className="border p-4">
          <ActivityChart data={testActivityData} />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">XP Chart Test</h2>
        <div className="border p-4">
          <XPChart data={testXPData} />
        </div>
      </div>
    </div>
  )
}