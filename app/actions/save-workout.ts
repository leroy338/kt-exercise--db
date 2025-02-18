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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // First create a template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: workoutName,
        type: workoutType,
        template: {
          sections: [{
            name: "Main",
            exercises: exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest,
              muscleGroups: ex.muscleGroups
            }))
          }]
        },
        folder: folder || null,
        is_public: false
      })
      .select()
      .single()

    if (templateError) throw templateError
    return { success: true, templateId: template.id }
    
  } catch (error) {
    console.error('Error saving template:', error)
    return { success: false, error }
  }
} 