import { Construction } from "lucide-react"

export function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      {/* Outer container with corners */}
      <div className="relative max-w-md w-full">
        {/* Cyber corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
        
        {/* Inner container with border */}
        <div className="backdrop-blur-xl bg-background/60 border-2 border-cyan-400/50 rounded-xl p-8 m-2 text-center">
          <Construction className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
} 