"use client"

import Link from 'next/link'
import { Home, Dumbbell, FolderOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/protected", label: "Home", icon: Home },
  { href: "/protected/workout-builder", label: "Builder", icon: Dumbbell },
  { href: "/protected/saved-workouts", label: "Saved", icon: FolderOpen },
]

interface Profile {
  avatar_url: string | null
  email: string
  first_name: string | null
  last_name: string | null
}

export function Sidebar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, email, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error.message)
        return
      }

      if (data) {
        setProfile({
          avatar_url: data.avatar_url,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name
        })
      }
    }

    loadProfile()
  }, [])

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <div className="flex flex-col h-full p-4">
        <div className="flex flex-col items-center gap-4 pb-6 border-b">
          <Avatar className="h-16 w-16 aspect-square">
            <AvatarImage 
              src={profile?.avatar_url || ''} 
              className="object-cover"
              alt={`${profile?.first_name}'s avatar`}
            />
            <AvatarFallback className="text-lg">
              {profile?.first_name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center">
            <span className="font-medium">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : 'User'
              }
            </span>
            <span className="text-sm text-muted-foreground">
              {profile?.email}
            </span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
} 