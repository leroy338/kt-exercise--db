"use client"

import Link from 'next/link'
import { Home, Dumbbell, FolderOpen, History, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from "@/components/theme-switcher"

const navItems = [
  { href: "/protected", label: "Home", icon: Home },
  { href: "/protected/workout-builder", label: "Builder", icon: Dumbbell },
  { href: "/protected/saved-workouts", label: "Saved", icon: FolderOpen },
  { href: "/protected/workout-history", label: "History", icon: History },
]

interface Profile {
  avatar_url: string | null
  email: string
  first_name: string | null
  last_name: string | null
}

function NavContent({ profile, onNavigate }: { 
  profile: Profile | null
  onNavigate?: () => void 
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
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
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground
                  ${pathname === item.href ? 'bg-accent text-foreground' : ''}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function Sidebar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
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
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 border-b bg-background z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="h-full py-4 px-2">
                <NavContent profile={profile} onNavigate={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">KT Exercise DB</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={profile?.avatar_url || ''} 
                alt={`${profile?.first_name}'s avatar`}
              />
              <AvatarFallback>
                {profile?.first_name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background hidden lg:block z-30">
        <div className="flex flex-col h-full p-4">
          <NavContent profile={profile} />
        </div>
      </aside>
    </>
  )
} 