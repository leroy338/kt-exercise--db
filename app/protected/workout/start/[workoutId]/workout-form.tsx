"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

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

interface WorkoutLog {
  workout_id: number
  workout_name: string
  exercises: Exercise[]
}

export function WorkoutForm({ workoutId }: { workoutId: string }) {
  const [workout, setWorkout] = useState<WorkoutLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
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
        const workoutLog: WorkoutLog = {
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
  }, [workoutId, supabase])

  const updateSet = (setIndex: number, field: string, value: number) => {
    if (!workout) return

    const newWorkout = { ...workout }
    newWorkout.exercises[currentExerciseIndex].sets[setIndex] = {
      ...newWorkout.exercises[currentExerciseIndex].sets[setIndex],
      [field]: value
    }
    setWorkout(newWorkout)
  }

  const handleStart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to start workouts",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ start_time: new Date().toISOString() })
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)

      if (error) throw error

      setIsStarted(true)
      toast({
        title: "Workout Started",
        description: "Good luck with your workout!"
      })
    } catch (err) {
      console.error('Error starting workout:', err)
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive"
      })
    }
  }

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to log workouts",
          variant: "destructive"
        })
        return
      }

      // Update end time
      const { error: scheduleError } = await supabase
        .from('scheduled_workouts')
        .update({ end_time: new Date().toISOString() })
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)

      if (scheduleError) throw scheduleError

      // Get the workout template details
      const { data: workoutTemplate } = await supabase
        .from('saved_workouts')
        .select('workout_name, workout_type')
        .eq('workout_id', workoutId)
        .limit(1)
        .single()

      if (!workoutTemplate) {
        throw new Error('Workout template not found')
      }

      // Insert all exercises as separate log entries
      const { error } = await supabase
        .from('workout_logs')
        .insert(
          workout!.exercises.flatMap(exercise => 
            exercise.sets.map(set => ({
              workout_id: parseInt(workoutId),
              workout_name: workoutTemplate.workout_name,
              workout_type: workoutTemplate.workout_type,
              exercise_name: exercise.exercise_name,
              sets: exercise.target_sets,
              reps: exercise.target_reps,
              rest: 60, // default rest time
              muscle_group: exercise.muscle_group,
              user_id: user.id,
              weight: set.weight || 0,
              reps_completed: set.reps_completed || 0,
            }))
          )
        )

      if (error) throw error

      toast({
        title: "Workout Completed",
        description: "Your workout has been logged successfully."
      })
      
      router.push('/protected/workout-history')
    } catch (err) {
      console.error('Error completing workout:', err)
      toast({
        title: "Error",
        description: "Failed to complete workout",
        variant: "destructive"
      })
    }
  }

  const nextExercise = () => {
    if (workout && currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!workout) return <div className="p-6">Workout not found</div>

  const currentExercise = workout.exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{workout.workout_name}</h1>
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{exercise.exercise_name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {exercise.target_sets} sets × {exercise.target_reps} reps
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {!isStarted ? (
            <Button 
              onClick={handleStart} 
              className="w-full mt-6"
              size="lg"
            >
              Start Workout
            </Button>
          ) : (
            <div className="space-y-6 mt-6">
              <Progress value={progress} />
              <Button 
                onClick={handleComplete}
                className="w-full"
                size="lg"
              >
                Complete Workout
              </Button>
            </div>
          )}
        </Card>

        {isStarted && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{workout.workout_name}</h1>
              <div className="text-sm text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
              </div>
            </div>

            <Progress value={progress} className="mb-6" />

            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{currentExercise.exercise_name}</h2>
                  <div className="text-sm text-muted-foreground">
                    Target: {currentExercise.target_sets} sets × {currentExercise.target_reps} reps
                  </div>
                </div>

                <div className="space-y-4">
                  {currentExercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        Set {set.set_number}
                      </div>
                      <Input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(
                          setIndex,
                          'weight',
                          Number(e.target.value)
                        )}
                      />
                      <Input
                        type="number"
                        placeholder={`Reps (target: ${currentExercise.target_reps})`}
                        value={set.reps_completed || ''}
                        onChange={(e) => updateSet(
                          setIndex,
                          'reps_completed',
                          Number(e.target.value)
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="mt-6 flex justify-between items-center">
              <Button
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentExerciseIndex === workout.exercises.length - 1 ? (
                <Button onClick={handleComplete}>
                  Complete Workout
                </Button>
              ) : (
                <Button onClick={nextExercise}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 