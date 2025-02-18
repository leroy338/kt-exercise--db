"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const teamMembers = [
  "John Smith",
  "Sarah Johnson",
  "Mike Williams",
  "Emma Davis",
  "Alex Brown",
  "Lisa Wilson",
]

interface ProgressData {
  date: string
  volume: number
  maxWeight: number
}

const mockData: Record<string, ProgressData[]> = {
  "John Smith": [
    { date: "Jan 1", volume: 12000, maxWeight: 225 },
    { date: "Jan 8", volume: 13500, maxWeight: 235 },
    { date: "Jan 15", volume: 14200, maxWeight: 245 },
    { date: "Jan 22", volume: 15000, maxWeight: 255 },
    { date: "Jan 29", volume: 16000, maxWeight: 265 },
  ],
  "Sarah Johnson": [
    { date: "Jan 1", volume: 8000, maxWeight: 155 },
    { date: "Jan 8", volume: 8800, maxWeight: 165 },
    { date: "Jan 15", volume: 9500, maxWeight: 175 },
    { date: "Jan 22", volume: 10200, maxWeight: 185 },
    { date: "Jan 29", volume: 11000, maxWeight: 195 },
  ],
  // Add more mock data for other team members...
}

export function ProgressChart() {
  const [selectedMember, setSelectedMember] = useState(teamMembers[0])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progress Tracking</h3>
        <Select
          value={selectedMember}
          onValueChange={setSelectedMember}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member} value={member}>
                {member}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData[selectedMember]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="volume" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Total Volume"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="maxWeight" 
              stroke="#6366f1" 
              strokeWidth={2}
              name="Max Weight"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 