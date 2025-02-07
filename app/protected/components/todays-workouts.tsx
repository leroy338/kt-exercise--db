"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { workoutTypes } from "@/app/config/workout-types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PlayCircle } from "lucide-react"

interface WorkoutEvent {
  workout_id: number
  workout_name: string
  workout_type: string
  created_at: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
  }[]
}

export function TodaysWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutEvent[]>([])
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTodaysWorkouts()
  }, [])

  const fetchTodaysWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date()
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)

      // First get scheduled workouts for today
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          workout_id,
          scheduled_for
        `)
        .eq('user_id', user.id)
        .gte('scheduled_for', startOfDay.toISOString())
        .lte('scheduled_for', endOfDay.toISOString())

      if (scheduledError) throw scheduledError

      // Then get the workout details for each scheduled workout
      const workoutPromises = scheduledData.map(async (schedule) => {
        const { data, error } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            created_at
          `)
          .eq('workout_id', schedule.workout_id)
          .eq('user_id', user.id)

        if (error) throw error
        return { data, scheduledFor: schedule.scheduled_for }
      })

      const workoutResults = await Promise.all(workoutPromises)

      // Group workouts
      const workoutMap = new Map<number, WorkoutEvent>()
      workoutResults.forEach(({ data, scheduledFor }) => {
        data.forEach(row => {
          if (!workoutMap.has(row.workout_id)) {
            workoutMap.set(row.workout_id, {
              workout_id: row.workout_id,
              workout_name: row.workout_name,
              workout_type: row.workout_type,
              created_at: scheduledFor,
              exercises: []
            })
          }
          workoutMap.get(row.workout_id)?.exercises.push({
            exercise_name: row.exercise_name,
            sets: row.sets,
            reps: row.reps
          })
        })
      })

      setWorkouts(Array.from(workoutMap.values()))
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast({
        title: "Error",
        description: "Failed to load today's workouts",
        variant: "destructive"
      })
    }
  }

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/protected/workout/start/${workoutId}`)
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Today's Workouts</h3>
      <div className="space-y-4">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <Card key={workout.workout_id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{workout.workout_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(workout.created_at), "p")}
                  </p>
                </div>
                <Badge variant="secondary">
                  {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                </Badge>
              </div>
              <div className="space-y-2 mt-4">
                {workout.exercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{exercise.exercise_name}</span>
                    <span className="text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleStartWorkout(workout.workout_id)}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No workouts scheduled for today</p>
        )}
      </div>
    </Card>
  )
}
