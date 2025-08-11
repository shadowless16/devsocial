"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const testData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 20 },
  { name: 'C', value: 15 },
  { name: 'D', value: 25 }
]

export function SimpleChart() {
  return (
    <div style={{ width: '100%', height: '200px', border: '1px solid red' }}>
      <ResponsiveContainer>
        <LineChart data={testData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Line dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}