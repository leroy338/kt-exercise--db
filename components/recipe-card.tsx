interface RecipeCardProps {
  title: string
  duration: string
  category: string
}

export function RecipeCard({ title, duration, category }: RecipeCardProps) {
  return (
    <div className="w-[300px] flex-shrink-0">
      <div className="relative">
        {/* Outer container with corners */}
        <div className="relative w-full">
          {/* Cyber corners */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
          
          {/* Inner container with border */}
          <div className="backdrop-blur-xl bg-background/60 border-2 border-cyan-400/50 rounded-lg p-2 m-2">
            <div className="h-24 rounded-md bg-muted mb-2"></div>
            <h3 className="font-semibold mb-1 text-xs">{title}</h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>{duration}</span>
              <span>•</span>
              <span>{category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 