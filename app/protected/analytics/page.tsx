"use client"

import { Card } from "@/components/ui/card"
import { WorkoutChart } from "./components/workout-chart"
import { ExerciseChart } from "./components/exercise-chart"
import { ProgressChart } from "./components/progress-chart"
import { TeamActivityChart } from "./components/team-activity-chart"
import { DateRangePicker } from "./components/date-range-picker"
import { useState } from "react"
import { DateRange } from "react-day-picker"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <WorkoutChart dateRange={dateRange} />
        </Card>

        <Card className="p-6">
          <ExerciseChart />
        </Card>

        <Card className="p-6">
          <ProgressChart />
        </Card>

        <Card className="p-6">
          <TeamActivityChart />
        </Card>
      </div>
    </div>
  )
} 