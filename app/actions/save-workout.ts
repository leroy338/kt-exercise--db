"use server"

import { createClient } from "@/utils/supabase/server"

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  section?: number
  section_name?: string
}

export async function saveWorkout(
  exercises: Exercise[],
  workoutName: string,
  muscleGroups: string[],
  workoutType: string,
  folder?: string
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

    // Add folder to the workout data
    const workoutData = exercises.map(exercise => ({
      workout_id: workoutId,
      workout_name: workoutName,
      workout_type: workoutType,
      exercise_name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      muscle_group: exercise.muscleGroups[0] || muscleGroups[0],
      section: exercise.section,
      section_name: exercise.section_name,
      user_id: user.id,
      folder: folder || null,
      created_at: new Date().toISOString()
    }))

    // Insert all exercises as separate rows
    const { error } = await supabase
      .from('saved_workouts')
      .insert(workoutData)

    if (error) throw error
    return { success: true, workoutId }
    
  } catch (error) {
    console.error('Error saving workout:', error)
    return { success: false, error }
  }
} 