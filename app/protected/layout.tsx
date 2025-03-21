"use client"

import { Sidebar } from "@/components/sidebar"
import { HeaderAuth } from "@/components/header-auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <HeaderAuth>
        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </HeaderAuth>

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
    </div>
  )
} 