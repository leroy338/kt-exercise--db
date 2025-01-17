"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Exercise {
  exercise_name: string
  sets: {
    set_number: number
    reps_completed: number
    weight: number
  }[]
  target_sets: number
  target_reps: number
}

interface WorkoutLog {
  workout_id: number
  workout_name: string
  exercises: Exercise[]
}

export function WorkoutForm({ workoutId }: { workoutId: string }) {
  const [workout, setWorkout] = useState<WorkoutLog | null>(null)
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
        .select('workout_id, workout_name, exercise_name, sets, reps')
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

  const handleComplete = async () => {
    if (!workout) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        return
      }

      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: Number(workout.workout_id),
          exercise_logs: { exercises: workout.exercises }
        })

      if (error) throw error

      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Error saving workout:', err)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!workout) return <div className="p-6">Workout not found</div>

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{workout.workout_name}</h1>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead>Target Sets</TableHead>
              <TableHead>Target Reps</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workout.exercises.map((exercise, exerciseIndex) => (
              <>
                <TableRow 
                  key={exerciseIndex}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedExercise(
                    expandedExercise === exerciseIndex ? null : exerciseIndex
                  )}
                >
                  <TableCell>{exercise.exercise_name}</TableCell>
                  <TableCell>{exercise.target_sets}</TableCell>
                  <TableCell>{exercise.target_reps}</TableCell>
                  <TableCell>
                    {expandedExercise === exerciseIndex ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </TableCell>
                </TableRow>
                
                {expandedExercise === exerciseIndex && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-4">
                      <div className="space-y-4">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="grid grid-cols-3 gap-4">
                            <div className="flex items-center">
                              Set {set.set_number}
                            </div>
                            <Input
                              type="number"
                              placeholder="Weight (lbs)"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                Number(e.target.value)
                              )}
                            />
                            <Input
                              type="number"
                              placeholder={`Reps (target: ${exercise.target_reps})`}
                              value={set.reps_completed || ''}
                              onChange={(e) => updateSet(
                                exerciseIndex,
                                setIndex,
                                'reps_completed',
                                Number(e.target.value)
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleComplete}>
            Complete Workout
          </Button>
        </div>
      </div>
    </div>
  )
} 