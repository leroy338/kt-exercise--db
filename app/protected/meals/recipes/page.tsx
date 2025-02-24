"use client"

import { FavoritesViewer } from "@/components/favorites-viewer"
import { FolderRecipes } from "@/components/folder-recipes"
import { NewRecipeModal } from "@/components/new-recipe-modal"

export default function RecipesPage() {
  // This would come from your database
  const recipes = Array(6).fill({
    title: "Protein Pancakes",
    duration: "30 mins",
    category: "High Protein"
  })

  const folders = [
    { name: "Breakfast", recipeCount: 12 },
    { name: "Lunch", recipeCount: 8 },
    { name: "Dinner", recipeCount: 15 },
    { name: "Snacks", recipeCount: 6 },
    { name: "Desserts", recipeCount: 9 },
    { name: "High Protein", recipeCount: 18 },
    { name: "Low Carb", recipeCount: 14 },
    { name: "Vegetarian", recipeCount: 11 },
  ]

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Favorite Recipes</h1>
        <NewRecipeModal />
      </div>
      <FavoritesViewer recipes={recipes} />
      <h2 className="text-xl font-bold mt-8 mb-4">Recipe Folders</h2>
      <FolderRecipes folders={folders} />
    </div>
  )
}