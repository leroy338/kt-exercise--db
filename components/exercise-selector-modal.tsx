"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { exercises } from "@/app/config/exercises"
import { muscleGroups } from "@/app/config/muscle-groups"
import { workoutTypes } from "@/app/config/workout-types"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  type: string
}

interface ExerciseSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExerciseSelect: (exercise: Exercise) => void
  workoutType?: string
  editingExercise?: Exercise | null
}

export function ExerciseSelectorModal({
  open,
  onOpenChange,
  onExerciseSelect,
  workoutType
}: ExerciseSelectorModalProps) {
  const [step, setStep] = useState<"type" | "exercises" | "details">("type")
  const [selectedType, setSelectedType] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>()
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null)
  const [sets, setSets] = useState("3")
  const [reps, setReps] = useState("10")
  const [rest, setRest] = useState("60")

  const filteredExercises = exercises.filter(exercise => {
    if (!selectedMuscleGroup) return exercise.type === (workoutType || selectedType)
    return exercise.type === (workoutType || selectedType) && exercise.muscleGroups.includes(selectedMuscleGroup)
  })

  useEffect(() => {
    if (open) {
      setStep(workoutType ? "exercises" : "type")
      setSelectedType(workoutType || "")
      setSelectedMuscleGroup(undefined)
      setSelectedExercise(null)
      setSets("3")
      setReps("10")
      setRest("60")
    }
  }, [open, workoutType])

  const handleNext = () => {
    setStep("exercises")
  }

  const handleExerciseSelect = (exercise: typeof exercises[0]) => {
    setSelectedExercise(exercise)
    setSets(exercise.defaultSets.toString())
    setReps(exercise.defaultReps.toString())
    setRest(exercise.defaultRest.toString())
    setStep("details")
  }

  const handleSubmit = () => {
    if (!selectedExercise) return
    
    onExerciseSelect({
      ...selectedExercise,
      type: selectedType,
      sets: parseInt(sets),
      reps: parseInt(reps),
      rest: parseInt(rest)
    })
    
    // Reset and close only after submission
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setStep(workoutType ? "exercises" : "type")
    setSelectedType(workoutType || "")
    setSelectedMuscleGroup(undefined)
    setSelectedExercise(null)
    setSets("3")
    setReps("10")
    setRest("60")
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "type" ? "Select Workout Type" : 
             step === "exercises" ? "Select Exercise" : 
             "Set Exercise Details"}
          </DialogTitle>
        </DialogHeader>

        {step === "type" ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Exercise Type</Label>
              <Select onValueChange={setSelectedType} value={selectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleNext}
              disabled={!selectedType}
            >
              Next
            </Button>
          </div>
        ) : step === "exercises" ? (
          <div className="space-y-4 py-4">
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
                    onClick={() => handleExerciseSelect(exercise)}
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
        ) : (
          <div className="space-y-6 py-4">
            {selectedExercise && (
              <>
                <div className="font-medium text-lg">{selectedExercise.name}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets">Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rest">Rest (seconds)</Label>
                  <Input
                    id="rest"
                    type="number"
                    value={rest}
                    onChange={(e) => setRest(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                >
                  Add Exercise
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 