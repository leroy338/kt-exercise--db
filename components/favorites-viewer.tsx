"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { RecipeCard } from "@/components/recipe-card"

interface FavoritesViewerProps {
  recipes: Array<{
    title: string
    duration: string
    category: string
  }>
}

export function FavoritesViewer({ recipes }: FavoritesViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full backdrop-blur-md bg-background/60 border border-cyan-200/50 hover:bg-accent/50 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button 
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full backdrop-blur-md bg-background/60 border border-cyan-200/50 hover:bg-accent/50 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Inner container with border */}
      <div className="backdrop-blur-xl bg-background/60 border-2 border-cyan-400/50 rounded-xl p-2 relative">
        <div className="absolute left-0 top-0 w-[30%] h-full bg-gradient-to-r from-background/80 via-background/50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 w-[30%] h-full bg-gradient-to-l from-background/80 via-background/50 to-transparent z-10"></div>
        <div 
          ref={scrollContainerRef} 
          className="flex gap-3 pb-2 overflow-x-auto scroll-smooth"
          style={{
            scrollPaddingLeft: "calc(50% - 150px)",
            scrollSnapType: "x mandatory",
            paddingLeft: "calc(50% - 150px)",
            paddingRight: "calc(50% - 150px)",
            maskImage: "linear-gradient(to right, transparent, black 25%, black 75%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 25%, black 75%, transparent)"
          }}
        >
          {recipes.map((recipe, index) => (
            <div 
              key={index} 
              className="scroll-snap-center"
            >
              <RecipeCard {...recipe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 