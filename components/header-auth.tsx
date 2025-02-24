"use client"

import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

interface HeaderAuthProps {
  className?: string
  children?: React.ReactNode
}

export function HeaderAuth({ className = "" }: HeaderAuthProps) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
  ]

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
            <>
              <nav className="hidden md:flex items-center justify-center flex-1 px-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>

              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {!user && mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/80 backdrop-blur-xl">
            <div className="container px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t my-2 pt-2 space-y-2">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Log in
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full justify-start">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
