import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Hero } from "./components/stacked-hero"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between px-4 max-w-full">
          <div className="font-semibold text-lg truncate">Biohackrr</div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>
      <Hero
        title="Track Your Fitness Journey"
        subtitle="Optimize your workouts with data-driven insights and personalized tracking"
        image="/Logo-Transparent.png"
        primaryCta={{ text: "Sign Up For The Private Beta", href: "/signup" }}
        secondaryCta={{ text: "View Features", href: "/features" }}
      />


    </div>
  )
}
