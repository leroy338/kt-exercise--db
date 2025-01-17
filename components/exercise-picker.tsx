"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { exercises } from "@/app/config/exercises"
import { muscleGroups } from "@/app/config/muscle-groups"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ExercisePickerProps {
  workoutType: string
  onSelectExercise: (exercise: typeof exercises[0]) => void
  defaultMuscleGroup?: string
}

export function ExercisePicker({ 
  workoutType, 
  onSelectExercise,
  defaultMuscleGroup 
}: ExercisePickerProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(defaultMuscleGroup)

  const filteredExercises = exercises.filter(exercise => {
    if (!selectedMuscleGroup) return true
    return exercise.muscleGroups.includes(selectedMuscleGroup)
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {muscleGroups.map((group) => (
          <Button
            key={group.id}
            size="sm"
            variant={selectedMuscleGroup === group.id ? "default" : "outline"}
            onClick={() => setSelectedMuscleGroup(
              selectedMuscleGroup === group.id ? undefined : group.id
            )}
          >
            {group.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[50vh] border rounded-md">
        <div className="p-4 grid gap-2">
          {filteredExercises.map((exercise) => (
            <Button
              key={exercise.name}
              variant="ghost"
              className="justify-start h-auto py-2 px-4"
              onClick={() => onSelectExercise(exercise)}
            >
              <div className="text-left">
                <div className="font-medium">{exercise.name}</div>
                <div className="text-xs text-muted-foreground">
                  {exercise.muscleGroups
                    .map(id => muscleGroups.find(g => g.id === id)?.label)
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}