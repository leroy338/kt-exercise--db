"use client"

import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import Link from "next/link"

interface HeaderAuthProps {
  className?: string
  children?: React.ReactNode
}

export function HeaderAuth({ className = "" }: HeaderAuthProps) {
  const { user } = useAuth()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
      <header className={`mx-auto ${className}`}>
        <div className="flex h-14 items-center justify-between px-4 md:container">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/Logo-Transparent.png" 
                alt="Biohackrr Logo" 
                width={32} 
                height={32}
                className="rounded-full"
              />
              <div className="font-semibold text-sm">Biohackrr</div>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <UserDropdown />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary">About</Link>
                <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary">Features</Link>
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary">Pricing</Link>
              </nav>
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-primary">Log in</Link>
                <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90">Sign up</Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}
