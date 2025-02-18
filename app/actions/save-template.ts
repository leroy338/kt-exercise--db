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
      muscleGroups: string[]
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
  template: Template
  is_public?: boolean
  folder?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        type,
        template,
        is_public,
        folder: folder || null
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error saving template:', error)
    return { success: false, error }
  }
} 