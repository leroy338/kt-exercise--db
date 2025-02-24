"use client"

import Link from 'next/link'
import { Home, Dumbbell, FolderOpen, History, Menu, Plus, Calendar, ChevronDown, ChevronRight, LayoutList, User, Users, UtensilsCrossed } from 'lucide-react'
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
  { href: "/protected/feed", label: "Feed", icon: LayoutList },
  { href: "/protected/team", label: "Team", icon: Users },
]

const workoutNavItems = [
  { href: "/protected/builder", label: "Builder", icon: Plus },
  { href: "/protected/saved-workouts", label: "Saved", icon: FolderOpen },
  { href: "/protected/plans", label: "Plans", icon: Calendar },
  { href: "/protected/workout-history", label: "History", icon: History }
]

const mealNavItems = [
  { href: "/protected/meals/recipes", label: "Recipes", icon: FolderOpen },
  { href: "/protected/meals/meal-plan", label: "Meal Plan", icon: Calendar },
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
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false)
  const [isMealsOpen, setIsMealsOpen] = useState(false)

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
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  pathname === item.href ? "bg-accent text-foreground" : ""
                )}
                style={{ cursor: 'pointer' }}
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

          <li className="pt-2">
            <Collapsible
              open={isMealsOpen}
              onOpenChange={setIsMealsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between px-3 py-2 font-normal hover:bg-accent text-muted-foreground hover:text-foreground",
                    mealNavItems.some(item => pathname === item.href) ? "bg-accent/50 text-foreground" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="h-5 w-5" />
                    <span>Meals</span>
                  </div>
                  {isMealsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-10 space-y-2 pt-2">
                {mealNavItems.map((item) => (
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
      
      {/* Add profile section at bottom */}
      <div className="border-t pt-4">
        <Link
          href="/protected/profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground",
            pathname === "/protected/profile" ? "bg-accent text-foreground" : ""
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || '/avatars/default.png'} />
              <AvatarFallback>
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm">
                {profile?.first_name 
                  ? `${profile.first_name} ${profile.last_name || ''}`
                  : 'Profile'}
              </span>
              {profile?.email && (
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {profile.email}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
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

      if (data) {
        setProfile(data)
      }
    }

    loadProfile()
  }, [])

  // Only render desktop version
  return (
    <aside className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background pointer-events-auto z-30">
      <NavContent profile={profile} onNavigate={onNavigate} />
    </aside>
  )
}

// Export NavContent for reuse in MobileNav
export { NavContent } 