"use client"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { FeedDropdown } from "@/components/feed-dropdown"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import Link from "next/link"

interface HeaderAuthProps {
  className?: string
}

export function HeaderAuth({ className = "" }: HeaderAuthProps) {
  const { user } = useAuth()

  return (
    <header className={`fixed top-0 z-40 w-full border-b bg-background ${className}`}>
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/Logo-Transparent.png" 
              alt="Biohackrr Logo" 
              width={48} 
              height={48}
              className="rounded-full"
            />
            <div className="font-semibold">Biohackrr</div>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-3 md:gap-4">
            <FeedDropdown />
            <ThemeSwitcher />
            <UserDropdown />
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/about" 
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                About
              </Link>
              <Link 
                href="/features" 
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Link 
                href="/sign-in" 
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Log in
              </Link>
              <Link 
                href="/sign-up"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
