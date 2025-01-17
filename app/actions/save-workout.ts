"use server"

import { createClient } from "@/utils/supabase/server"

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
}

export async function saveWorkout(
  exercises: Exercise[],
  workoutName: string,
  muscleGroups: string[]
) {
  const supabase = await createClient()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the next workout ID
    const { data: maxWorkout } = await supabase
      .from('saved_workouts')
      .select('workout_id')
      .order('workout_id', { ascending: false })
      .limit(1)
      .single()

    const workoutId = (maxWorkout?.workout_id || 0) + 1

    // Insert all exercises as separate rows
    const { error } = await supabase
      .from('saved_workouts')
      .insert(
        exercises.map(exercise => ({
          workout_id: workoutId,
          workout_name: workoutName,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          muscle_group: exercise.muscleGroups[0] || muscleGroups[0],
          user_id: user.id,
          created_at: new Date().toISOString()
        }))
      )

    if (error) throw error
    return { success: true, workoutId }
    
  } catch (error) {
    console.error('Error saving workout:', error)
    return { success: false, error }
  }
} 