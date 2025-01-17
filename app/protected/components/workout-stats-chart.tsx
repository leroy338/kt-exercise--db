"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { muscleGroups } from "@/app/config/muscle-groups"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MuscleGroupCount {
  muscle_group: string
  count: number
}

const chartConfig = {
  count: {
    label: "Exercises",
    color: "hsl(var(--slate-700))",
  }
}

export function WorkoutStatsChart() {
  const [data, setData] = useState<MuscleGroupCount[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkoutStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_workouts')
        .select('muscle_group')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching workout stats:', error)
        return
      }

      // Count workouts by muscle group
      const counts = data.reduce((acc: { [key: string]: number }, curr) => {
        if (curr.muscle_group) {
          acc[curr.muscle_group] = (acc[curr.muscle_group] || 0) + 1
        }
        return acc
      }, {})

      // Convert to array format and add muscle group labels
      const chartData = Object.entries(counts).map(([groupId, count]) => ({
        muscle_group: muscleGroups.find(g => g.id === groupId)?.label || groupId,
        count: count
      }))

      // Sort by count descending
      chartData.sort((a, b) => b.count - a.count)

      setData(chartData)
    }

    fetchWorkoutStats()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercises by Muscle Group</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} className="stroke-muted" />
            <XAxis 
              dataKey="muscle_group" 
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="count" 
              className="fill-slate-700 dark:fill-slate-200"
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 