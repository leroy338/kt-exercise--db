"use client"

import { Sidebar } from "@/components/sidebar"
import { HeaderAuth } from "@/components/header-auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MobileNav } from "@/components/mobile-nav"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <HeaderAuth />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="relative w-full overflow-x-hidden pt-14 px-4 lg:pl-64">
        <div className="mx-auto w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
} 