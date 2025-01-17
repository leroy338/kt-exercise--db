import { WorkoutStatsChart } from "@/app/protected/components/workout-stats-chart"

export default function ProtectedHome() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to KT Exercise DB</h1>
        <p className="text-muted-foreground">
          Track your workouts and monitor your progress
        </p>
      </div>
      <div className="mt-8">
        <WorkoutStatsChart />
      </div>
    </div>
  )
}
