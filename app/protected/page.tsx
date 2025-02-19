import { WorkoutStatsChart } from "@/app/protected/components/workout-stats-chart"
import { TodaysWorkouts } from "@/app/protected/components/todays-workouts"
import { WeeklyMuscleGroups } from "@/components/weekly-muscle-groups"

export default function ProtectedHome() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">Welcome to Biohackrr</h1>
        <p className="text-muted-foreground">
          Track your workouts and monitor your progress
        </p>
      </div>
      <div className="grid gap-8">
        <div className="grid gap-8 md:grid-cols-2">
          <TodaysWorkouts />
          <WeeklyMuscleGroups scheduledWorkouts={[]} />
        </div>
        <WorkoutStatsChart />
      </div>
    </div>
  )
}
