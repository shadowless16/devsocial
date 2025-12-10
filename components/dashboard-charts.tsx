"use client"

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]

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

export function ActivityChart({ data }: ActivityChartProps) {
  console.log('ActivityChart received data:', data)
  
  if (!data || data.length === 0) {
    console.log('ActivityChart: No data provided')
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500 border border-red-200">
        <p>No activity data available</p>
      </div>
    )
  }
  
  console.log('ActivityChart: Rendering with', data.length, 'data points')

  return (
    <div className="w-full h-[200px] border border-blue-200 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Line 
            dataKey="xp" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            dataKey="activities" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function XPChart({ data }: XPChartProps) {
  console.log('XPChart received data:', data)
  
  if (!data || data.length === 0) {
    console.log('XPChart: No data provided')
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500 border border-red-200">
        <p>No XP data available</p>
      </div>
    )
  }
  
  console.log('XPChart: Rendering with', data.length, 'data points')

  return (
    <>
      <div className="w-full h-[200px] border border-green-200 bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={30}
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: unknown, name: string) => [`${value} XP`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {entry.name}: {entry.value} XP
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

const DashboardCharts = { ActivityChart, XPChart }
export default DashboardCharts