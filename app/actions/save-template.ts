'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  type: string
  section?: number
  section_name?: string
}

interface Template {
  name: string
  type: string
  sections: {
    name: string
    exercises: {
      name: string
      sets: number
      reps: number
      rest: number
      muscle_group: string
      type: string
    }[]
  }[]
}

export async function saveTemplate({
  name,
  type,
  template,
  is_public = false,
  folder
}: {
  name: string
  type: string
  template: any
  is_public?: boolean
  folder?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        type,
        template,
        is_public,
        folder: folder || null
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error saving template:', error)
    return { success: false, error }
  }
} 