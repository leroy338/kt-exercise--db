"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { name: "John Smith", activeDays: 18, totalWorkouts: 24 },
  { name: "Sarah Johnson", activeDays: 15, totalWorkouts: 20 },
  { name: "Mike Williams", activeDays: 12, totalWorkouts: 15 },
  { name: "Emma Davis", activeDays: 10, totalWorkouts: 12 },
  { name: "Alex Brown", activeDays: 8, totalWorkouts: 10 },
  { name: "Lisa Wilson", activeDays: 7, totalWorkouts: 8 },
].sort((a, b) => b.activeDays - a.activeDays)

export function TeamActivityChart() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Activity</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150}
              tick={{ fontSize: 14 }}
            />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'activeDays' ? 'Active Days' : 'Total Workouts'
              ]}
            />
            <Bar 
              dataKey="activeDays" 
              fill="#10b981" 
              name="Active Days"
              radius={[0, 4, 4, 0]}
            />
            <Bar 
              dataKey="totalWorkouts" 
              fill="#6366f1" 
              name="Total Workouts"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 