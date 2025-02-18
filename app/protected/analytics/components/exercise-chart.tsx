"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { muscleGroup: "Chest", count: 45 },
  { muscleGroup: "Back", count: 40 },
  { muscleGroup: "Legs", count: 38 },
  { muscleGroup: "Shoulders", count: 35 },
  { muscleGroup: "Arms", count: 30 },
  { muscleGroup: "Core", count: 25 },
].sort((a, b) => b.count - a.count)

export function ExerciseChart() {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="muscleGroup" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 