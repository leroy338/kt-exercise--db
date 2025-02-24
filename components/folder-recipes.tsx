"use client"

import { Folder } from "lucide-react"

interface RecipeFolder {
  name: string
  recipeCount: number
}

interface FolderRecipesProps {
  folders: RecipeFolder[]
}

export function FolderRecipes({ folders }: FolderRecipesProps) {
  return (
    <div className="relative w-full mt-8">
      {/* Inner container with border */}
      <div className="backdrop-blur-xl bg-background/60 border-2 border-cyan-400/50 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {folders.map((folder, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative">
                {/* Folder cyber corners */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_5px_0px_rgba(34,211,238,0.5)]"></div>

                <div className="backdrop-blur-xl bg-background/60 border-2 border-cyan-400/50 rounded-lg p-3 m-2 transition-colors group-hover:bg-accent/50">
                  <div className="flex items-center justify-center mb-2">
                    <Folder className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-center mb-1 truncate">{folder.name}</h3>
                  <p className="text-[10px] text-muted-foreground text-center">
                    {folder.recipeCount} {folder.recipeCount === 1 ? 'recipe' : 'recipes'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 