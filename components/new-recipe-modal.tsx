"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Folder, X, Upload } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, KeyboardEvent, FormEvent } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { TablesInsert, Json } from "@/types/database.types"
import { uploadRecipeImage } from "@/app/actions"

interface Ingredient {
  item: string
  amount?: string
  unit?: string
}

interface Step {
  order: number
  step: string
}

export function NewRecipeModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    recipe_name: "",
    duration: "",
    duration_type: "minutes" as "minutes" | "hours",
    folder: "",
    categories: [] as string[],
  })
  const [notes, setNotes] = useState("")
  const supabase = createClient()
  const { toast } = useToast()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState("")
  const [headerImage, setHeaderImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const folders = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Desserts",
    "High Protein",
    "Low Carb",
    "Vegetarian",
  ]

  const parseIngredient = (text: string): Ingredient => {
    // Remove leading/trailing spaces and split by first comma if exists
    const parts = text.trim().split(/,(.+)/)
    
    if (parts.length === 1) {
      return { item: parts[0] }
    }

    // Try to extract amount and unit from the first part
    const firstPart = parts[0].trim()
    const amountMatch = firstPart.match(/^(\d+(?:\.\d+)?)\s*(.*)/)

    if (amountMatch) {
      return {
        item: parts[1].trim(),
        amount: amountMatch[1],
        unit: amountMatch[2] || undefined
      }
    }

    return { item: text.trim() }
  }

  const addIngredient = (text: string) => {
    if (!text.trim()) return
    const newIngredient = parseIngredient(text)
    setIngredients(prev => [...prev, newIngredient])
    setCurrentIngredient("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredient(currentIngredient)
    }
    if (e.key === ',' && !e.shiftKey) {
      e.preventDefault()
      addIngredient(currentIngredient)
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  const addStep = (text: string) => {
    if (!text.trim()) return
    const newStep = {
      order: steps.length + 1,
      step: text.trim()
    }
    setSteps(prev => [...prev, newStep])
    setCurrentStep("")
  }

  const handleStepKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addStep(currentStep)
    }
  }

  const removeStep = (index: number) => {
    setSteps(prev => {
      const newSteps = prev.filter((_, i) => i !== index)
      // Reorder remaining steps
      return newSteps.map((step, i) => ({
        ...step,
        order: i + 1
      }))
    })
  }

  const handleImageUpload = async (file: File) => {
    setHeaderImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log("Auth check:", { user, authError })

      if (!user) throw new Error("Not authenticated")

      let header_image = null
      if (headerImage) {
        header_image = await uploadRecipeImage(headerImage)
      }

      const recipeData: TablesInsert<"recipes"> = {
        recipe_name: formData.recipe_name,
        duration: parseInt(formData.duration),
        duration_type: formData.duration_type,
        folder: formData.folder || null,
        categories: formData.categories,
        ingredients: ingredients as unknown as Json,
        steps: steps as unknown as Json,
        notes: notes || null,
        header_image,
        user_id: user.id
      }
      console.log("Recipe data:", recipeData)

      const { error: insertError } = await supabase
        .from("recipes")
        .insert(recipeData)
      console.log("Insert error:", insertError)

      if (insertError) throw insertError

      toast({
        title: "Success",
        description: "Recipe created successfully!",
      })

      // Reset form
      setFormData({
        recipe_name: "",
        duration: "",
        duration_type: "minutes",
        folder: "",
        categories: [],
      })
      setIngredients([])
      setSteps([])
      setNotes("")
      setHeaderImage(null)
      setImagePreview(null)
      setOpen(false)
    } catch (error) {
      console.error("Error creating recipe:", error)
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-cyan-400/50 hover:bg-accent/50"
        >
          <Plus className="h-4 w-4" /> New Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95%] p-0 border-cyan-400/50 backdrop-blur-xl bg-background/60 max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-2 sm:p-6 pb-0">
            <div className="flex flex-row items-start justify-between">
              <DialogTitle className="text-xl sm:text-2xl">Create New Recipe</DialogTitle>
              <Select
                value={formData.folder}
                onValueChange={(value) => setFormData(prev => ({ ...prev, folder: value }))}
              >
                <SelectTrigger className="w-[180px] border-cyan-400/50">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem 
                      key={folder} 
                      value={folder}
                      className="hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-cyan-400" />
                        {folder}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-2 sm:px-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm sm:text-base">Header Image</Label>
                <div className="flex items-center gap-4">
                  <label 
                    className="flex items-center gap-2 px-4 py-2 border rounded-md border-cyan-400/50 hover:bg-accent/50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setHeaderImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-background/60 hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipe_name" className="text-sm sm:text-base">Title</Label>
                  <Input 
                    id="recipe_name"
                    value={formData.recipe_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipe_name: e.target.value }))}
                    placeholder="Enter recipe title"
                    className="border-cyan-400/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration" className="text-sm sm:text-base">Duration</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 30"
                      className="border-cyan-400/50"
                      required
                    />
                    <Select
                      value={formData.duration_type}
                      onValueChange={(value: "minutes" | "hours") => 
                        setFormData(prev => ({ ...prev, duration_type: value }))
                      }
                    >
                      <SelectTrigger className="w-[100px] border-cyan-400/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">mins</SelectItem>
                        <SelectItem value="hours">hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g., High Protein"
                  className="border-cyan-400/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ingredients" className="text-sm sm:text-base">
                  Ingredients
                  <span className="text-xs text-muted-foreground ml-2">
                    (Press Enter or add comma to separate)
                  </span>
                </Label>
                <Input 
                  id="ingredients" 
                  placeholder="e.g., 2 cups flour, 3 eggs"
                  className="border-cyan-400/50"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {ingredients.map((ingredient, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 bg-accent/50 px-2 py-1 rounded-md text-sm"
                    >
                      <span>
                        {ingredient.amount && `${ingredient.amount} `}
                        {ingredient.unit && `${ingredient.unit} `}
                        {ingredient.item}
                      </span>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="steps" className="text-sm sm:text-base">
                  Steps
                  <span className="text-xs text-muted-foreground ml-2">
                    (Press Enter for new step, Shift+Enter for new line)
                  </span>
                </Label>
                <Textarea 
                  id="steps" 
                  placeholder="Enter preparation step"
                  className="min-h-[100px] border-cyan-400/50"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  onKeyDown={handleStepKeyDown}
                />
                <div className="space-y-2 mt-2">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 bg-accent/50 p-2 rounded-md text-sm group"
                    >
                      <span className="font-medium min-w-[1.5rem]">{step.order}.</span>
                      <span className="flex-1">{step.step}</span>
                      <button
                        onClick={() => removeStep(index)}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm sm:text-base">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or tips"
                  className="min-h-[100px] border-cyan-400/50"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 p-2 sm:p-6 pt-2 border-t border-cyan-400/50">
            <Button 
              type="button"
              variant="outline" 
              className="border-cyan-400/50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-cyan-400/80 hover:bg-cyan-400/60"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 