import { WorkoutStatsChart } from "@/app/protected/components/workout-stats-chart"
import { TodaysWorkouts } from "@/app/protected/components/todays-workouts"
import { WeeklyMuscleGroups } from "@/components/weekly-muscle-groups"

export default function ProtectedHome() {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-4 py-6 w-full overflow-x-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
          <h1 className="text-xl md:text-2xl font-bold">
            Welcome to <span className="text-emerald-500">Biohackrr</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your workouts and monitor your progress
          </p>
        </div>
        
        <div className="space-y-6 w-full overflow-x-hidden">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="w-full overflow-hidden">
                <TodaysWorkouts />
              </div>
              <div className="w-full overflow-hidden">
                <WeeklyMuscleGroups scheduledWorkouts={[]} />
              </div>
            </div>
            <div className="w-full overflow-hidden bg-card rounded-lg p-4">
              <WorkoutStatsChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
