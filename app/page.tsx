import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="font-semibold text-lg">KT Exercise DB</div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-6 max-w-[600px]">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Track Your Fitness Journey
          </h1>
          <p className="text-muted-foreground text-lg">
            Log workouts, track progress, and achieve your fitness goals with KT Exercise DB.
            Simple, effective, and built for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in to continue
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-background">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KT Exercise DB. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
