"use client"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface HeaderAuthProps {
  className?: string
}

export function HeaderAuth({ className = "" }: HeaderAuthProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <header className={`fixed top-0 z-40 w-full border-b bg-background ${className}`}>
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="font-semibold">KT Exercise DB</div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeSwitcher />
          <Avatar className="h-8 w-8 md:h-9 md:w-9">
            <AvatarImage 
              src="https://github.com/shadcn.png" 
              alt="@shadcn"
              className="object-cover aspect-square"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8 md:h-9 md:w-9"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
