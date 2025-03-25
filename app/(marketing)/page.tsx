import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Hero } from "./components/stacked-hero"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
