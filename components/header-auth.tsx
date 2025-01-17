"use client"

import { ThemeSwitcher } from "@/components/theme-switcher"

export function HeaderAuth() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-semibold">KT Exercise DB</div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <span>Hey, Kevin!</span>
          <button className="text-sm">Sign out</button>
        </div>
      </div>
    </header>
  )
}
