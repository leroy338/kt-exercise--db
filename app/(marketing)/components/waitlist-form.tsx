"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WaitlistForm() {
  return (
    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
      <Input 
        type="email" 
        placeholder="Enter your email" 
        className="max-w-[240px]"
      />
      <Button type="submit">Join</Button>
    </form>
  )
} 