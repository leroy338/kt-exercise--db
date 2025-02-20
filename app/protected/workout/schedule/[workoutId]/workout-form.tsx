"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import React from "react"
import { Tables, TablesInsert } from "@/types/database.types"

type SavedWorkout = Tables<'saved_workouts'>
type ScheduledWorkout = TablesInsert<'scheduled_workouts'>
type WorkoutLog = TablesInsert<'workout_logs'>

interface Exercise {
  exercise_name: string
  sets: {
    set_number: number
    reps_completed: number
    weight: number
  }[]
  target_sets: number
  target_reps: number
  muscle_group: string
}

export function WorkoutForm({ workoutId }: { workoutId: string }) {
  const [workout, setWorkout] = useState<{ workout_id: number, workout_name: string, exercises: Exercise[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchWorkout() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_workouts')
        .select('workout_id, workout_name, exercise_name, sets, reps, muscle_group')
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching workout:', error)
        return
      }

      if (data && data.length > 0) {
        const workoutLog: { workout_id: number, workout_name: string, exercises: Exercise[] } = {
          workout_id: data[0].workout_id,
          workout_name: data[0].workout_name,
          exercises: data.map(exercise => ({
            exercise_name: exercise.exercise_name,
            target_sets: exercise.sets,
            target_reps: exercise.reps,
            muscle_group: exercise.muscle_group,
            sets: Array.from({ length: exercise.sets }, (_, i) => ({
              set_number: i + 1,
              reps_completed: 0,
              weight: 0
            }))
          }))
        }
        setWorkout(workoutLog)
      }
      setLoading(false)
    }

    fetchWorkout()
  }, [workoutId])

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: number) => {
    if (!workout) return

    const newWorkout = { ...workout }
    newWorkout.exercises[exerciseIndex].sets[setIndex] = {
      ...newWorkout.exercises[exerciseIndex].sets[setIndex],
      [field]: value
    }
    setWorkout(newWorkout)
  }

  const handleScheduleWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Not authenticated", variant: "destructive" })
        return
      }

      const scheduledWorkout = {
        user_id: user.id,
        workout_id: parseInt(workoutId),  // Changed from template_id to workout_id
        scheduled_for: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('scheduled_workouts')
        .insert(scheduledWorkout)

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast({ title: "Success", description: "Workout scheduled successfully" })
      router.push('/protected/workout-history')
    } catch (err) {
      console.error('Error scheduling workout:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to schedule workout",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!workout) return <div className="p-4">Workout not found</div>

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">{workout.workout_name}</h1>
          <p className="text-muted-foreground">
            Schedule this workout for later
          </p>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} className="overflow-hidden">
              {/* Exercise Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedExercise(
                  expandedExercise === exerciseIndex ? null : exerciseIndex
                )}
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{exercise.exercise_name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {exercise.target_sets} sets × {exercise.target_reps} reps
                  </div>
                </div>
                {expandedExercise === exerciseIndex ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>

              {/* Exercise Details */}
              {expandedExercise === exerciseIndex && (
                <div className="border-t">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex} 
                      className={`p-4 ${setIndex !== 0 ? 'border-t' : ''}`}
                    >
                      <div className="space-y-3">
                        <div className="font-medium text-sm">
                          Set {set.set_number}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                              Weight (lbs)
                            </label>
                            <Input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                              Reps
                            </label>
                            <Input
                              type="number"
                              value={set.reps_completed || ''}
                              onChange={(e) => updateSet(
                                exerciseIndex,
                                setIndex,
                                'reps_completed',
                                Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="container max-w-lg mx-auto">
            <Button 
              onClick={handleScheduleWorkout} 
              className="w-full"
              size="lg"
            >
              Schedule Workout
            </Button>
          </div>
        </div>

        {/* Bottom Padding for Fixed Button */}
        <div className="h-16" />
      </div>
    </div>
  )
} 