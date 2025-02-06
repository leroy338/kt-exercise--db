"use client"

import Link from 'next/link'
import { Home, Dumbbell, FolderOpen, History, Menu, Plus, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
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
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const mainNavItems = [
  { href: "/protected", label: "Home", icon: Home },
  { href: "/protected/planner", label: "Planner", icon: Calendar },
]

const workoutNavItems = [
  { href: "/protected/builder", label: "Builder", icon: Plus },
  { href: "/protected/saved-workouts", label: "Saved", icon: FolderOpen },
  { href: "/protected/workout-history", label: "History", icon: History },
  { href: "/protected/plans/builder", label: "Plan Builder", icon: Calendar },
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
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(true)

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground",
                  pathname === item.href ? "bg-accent text-foreground" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          
          <li className="pt-2">
            <Collapsible
              open={isWorkoutsOpen}
              onOpenChange={setIsWorkoutsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between px-3 py-2 font-normal hover:bg-accent text-muted-foreground hover:text-foreground",
                    workoutNavItems.some(item => pathname === item.href) ? "bg-accent/50 text-foreground" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5" />
                    <span>Workouts</span>
                  </div>
                  {isWorkoutsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-10 space-y-2 pt-2">
                {workoutNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground",
                      pathname === item.href ? "bg-accent text-foreground" : ""
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export function Sidebar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

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

  const onNavigate = () => {
    setIsOpen(false)
  }

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
            <SheetContent side="left" className="w-64 p-0">
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

        <div className="flex items-center">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background hidden lg:block z-30">
        <div className="flex flex-col h-full p-4">
          <NavContent profile={profile} onNavigate={onNavigate} />
        </div>
      </aside>
    </>
  )
} 