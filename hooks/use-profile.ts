"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

interface Profile {
  avatar_url: string | null
  email: string
  first_name: string | null
  last_name: string | null
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, email, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      if (data) setProfile(data)
    }

    loadProfile()
  }, [])

  return profile
} 