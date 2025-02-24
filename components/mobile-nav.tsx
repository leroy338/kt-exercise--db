"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface Profile {
  avatar_url: string | null
  email: string
  first_name: string | null
  last_name: string | null
}

export function MobileNav() {
  const { user } = useAuth()
  
  // If user is not authenticated, don't render the mobile nav
  if (!user) return null

  const [isOpen, setIsOpen] = useState(false)
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()
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

  const menuItems = [
    { href: "/protected", label: "Home", icon: "🏠" },
    { href: "/protected/planner", label: "Planner", icon: "📅" },
    { href: "/protected/feed", label: "Feed", icon: "📱" },
    { href: "/protected/team", label: "Team", icon: "👥" },
    { 
      label: "Workouts",
      icon: "💪",
      items: [
        { href: "/protected/builder", label: "Builder", icon: "🛠️" },
        { href: "/protected/saved-workouts", label: "Saved", icon: "📂" },
        { href: "/protected/plans", label: "Plans", icon: "📋" },
        { href: "/protected/workout-history", label: "History", icon: "📊" },
      ]
    },
    { href: "/protected/profile", label: "Profile", icon: "👤" },
  ]

  return (
    <div className="block lg:hidden">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="fixed bottom-4 right-4 z-50">
            <div className="backdrop-blur-md bg-background/60 border-2 border-cyan-400/50 rounded-full p-2 shadow-lg">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="w-72 p-4 rounded-xl border-2 border-cyan-400/50 backdrop-blur-xl bg-background/60 relative">
          <DialogTitle className="text-center text-base font-medium mb-3">
            Menu
          </DialogTitle>
          <div className="relative">
            <div className="absolute top-0 h-4 w-full bg-gradient-to-b from-background/90 to-transparent z-10 rounded-t-lg" />
            <ScrollArea className="h-[144px] px-1 overflow-y-auto">
              <div className="grid gap-1.5 py-2">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50",
                          pathname === item.href ? "bg-accent/50" : ""
                        )}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsWorkoutsOpen(!isWorkoutsOpen)}
                          className="flex items-center gap-3 px-3 py-2 text-muted-foreground w-full hover:bg-accent/50"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                        {isWorkoutsOpen && (
                          <div className="pl-4 grid gap-1">
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50",
                                  pathname === subItem.href ? "bg-accent/50" : ""
                                )}
                              >
                                <span className="text-lg">{subItem.icon}</span>
                                <span className="text-sm">{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="absolute bottom-0 h-4 w-full bg-gradient-to-t from-background/90 to-transparent z-10 rounded-b-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 