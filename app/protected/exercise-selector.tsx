"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export function ExerciseSelector() {
  const [exerciseType, setExerciseType] = useState<string>("")
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const router = useRouter()

  const handleCreateWorkout = () => {
    if (exerciseType) {
      const params = new URLSearchParams({
        type: exerciseType,
        muscles: selectedMuscleGroups.join(',')
      })
      router.push(`/protected/workout-builder?${params.toString()}`)
    }
  }

  const toggleMuscleGroup = (groupId: string) => {
    setSelectedMuscleGroups(prev => {
      const selected = prev.includes(groupId)
      return selected
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Select Exercise Type
        </h2>
        
        <Select onValueChange={setExerciseType} value={exerciseType}>
          <SelectTrigger className="w-full mb-6">
            <SelectValue placeholder="Choose type..." />
          </SelectTrigger>
          <SelectContent>
            {workoutTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mb-6 space-y-2">
          <Label>Target Muscle Groups</Label>
          
          {selectedMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedMuscleGroups.map(groupId => (
                <Badge
                  key={groupId}
                  variant="secondary"
                  className="text-xs"
                  onClick={() => toggleMuscleGroup(groupId)}
                >
                  {muscleGroups.find(g => g.id === groupId)?.label}
                  <span className="ml-1 cursor-pointer">×</span>
                </Badge>
              ))}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                {selectedMuscleGroups.length === 0 
                  ? "Select muscle groups" 
                  : `${selectedMuscleGroups.length} selected`}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {muscleGroups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => toggleMuscleGroup(group.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "mr-2 h-4 w-4 flex items-center justify-center",
                      selectedMuscleGroups.includes(group.id) 
                        ? "text-primary" 
                        : "opacity-0"
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    {group.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button 
          className="w-full" 
          onClick={handleCreateWorkout}
          disabled={!exerciseType}
        >
          Create Workout
        </Button>
      </div>
    </div>
  )
} 