"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { startOfDay, endOfDay, format } from "date-fns"
import { DateRange } from "react-day-picker"

interface WorkoutChartProps {
  dateRange: DateRange | undefined
}

export function WorkoutChart({ dateRange }: WorkoutChartProps) {
  const [data, setData] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const start = dateRange?.from
      const end = dateRange?.to
      
      let query = supabase
        .from('scheduled_workouts')
        .select('scheduled_for')

      if (start && end) {
        query = query
          .gte('scheduled_for', startOfDay(start).toISOString())
          .lte('scheduled_for', endOfDay(end).toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error:', error)
        return
      }

      // Process data for chart
      const processedData = data.reduce((acc: any, workout) => {
        const date = format(new Date(workout.scheduled_for), 'MMM d')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(processedData).map(([date, count]) => ({
        date,
        workouts: count,
      }))

      setData(chartData)
    }

    fetchData()
  }, [dateRange, supabase])

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="workouts" 
            stroke="#10b981" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 