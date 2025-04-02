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
import { Exercise as BaseExercise } from "@/app/config/exercises"

type WorkoutExercise = BaseExercise & {
  sets: number | null
  reps: number | null
  rest: number | null
  duration?: number | null
  section?: number
  section_name?: string
  order?: number
}

interface ExerciseSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExerciseSelect: (exercise: WorkoutExercise) => void
  workoutType: string
  editingExercise?: WorkoutExercise
}

export function ExerciseSelectorModal({
  open,
  onOpenChange,
  onExerciseSelect,
  workoutType,
  editingExercise
}: ExerciseSelectorModalProps) {
  const [step, setStep] = useState<"exercises" | "details">("exercises")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>()
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null)
  const [sets, setSets] = useState("3")
  const [reps, setReps] = useState("10")
  const [rest, setRest] = useState("60")
  const [duration, setDuration] = useState("30")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"muscle" | "type">("muscle")

  const workoutTypeConfig = workoutTypes.find(t => t.id === workoutType)
  const isCircuit = workoutTypeConfig?.builder === 'circuit'

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesFilter = true
    
    if (filterType === "muscle" && selectedMuscleGroup) {
      matchesFilter = exercise.muscleGroups.includes(selectedMuscleGroup)
    } else if (filterType === "type" && selectedMuscleGroup) {
      matchesFilter = exercise.type === selectedMuscleGroup
    }
    
    return matchesSearch && matchesFilter
  })

  const getFilterOptions = () => {
    switch (filterType) {
      case "muscle":
        return muscleGroups
      case "type":
        return workoutTypes
      default:
        return []
    }
  }

  useEffect(() => {
    if (open) {
      if (editingExercise) {
        setSelectedExercise(editingExercise)
        setStep("details")
        if (isCircuit) {
          setDuration(editingExercise.duration?.toString() || "30")
          setRest(editingExercise.rest?.toString() || "15")
        } else {
          setSets(editingExercise.sets?.toString() || "3")
          setReps(editingExercise.reps?.toString() || "10")
          setRest(editingExercise.rest?.toString() || "60")
        }
      } else {
        setStep("exercises")
        setSelectedMuscleGroup(undefined)
        setSelectedExercise(null)
        setSets("3")
        setReps("10")
        setRest("60")
        setDuration("30")
        setSearchQuery("")
        setFilterType("muscle")
      }
    }
  }, [open, editingExercise, isCircuit])

  const handleExerciseSelect = (exercise: typeof exercises[0]) => {
    setSelectedExercise(exercise)
    if (isCircuit) {
      setDuration(exercise.defaultDuration?.toString() || "30")
      setRest(exercise.defaultRest?.toString() || "15")
    } else {
      setSets(exercise.defaultSets?.toString() || "3")
      setReps(exercise.defaultReps?.toString() || "10")
      setRest(exercise.defaultRest?.toString() || "60")
    }
    setStep("details")
  }

  const handleSubmit = () => {
    if (!selectedExercise) return
    
    const workoutExercise: WorkoutExercise = {
      ...selectedExercise,
      type: workoutType,
      sets: parseInt(sets) || null,
      reps: parseInt(reps) || null,
      rest: parseInt(rest) || null,
      ...(isCircuit ? { duration: parseInt(duration) || null } : {}),
      section: 1,
      section_name: "Default Section",
      order: 1
    }
    
    onExerciseSelect(workoutExercise)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setStep("exercises")
    setSelectedMuscleGroup(undefined)
    setSelectedExercise(null)
    setSets("3")
    setReps("10")
    setRest("60")
    setDuration("30")
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
            {step === "exercises" ? "Select Exercise" : "Set Exercise Details"}
          </DialogTitle>
        </DialogHeader>

        {step === "exercises" ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {getFilterOptions().map((option) => (
                <Button
                  key={option.id}
                  size="sm"
                  variant={selectedMuscleGroup === option.id ? "default" : "outline"}
                  onClick={() => setSelectedMuscleGroup(
                    selectedMuscleGroup === option.id ? undefined : option.id
                  )}
                >
                  {option.label}
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
                  {isCircuit ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Work Duration (seconds)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                {!isCircuit && (
                  <div className="space-y-2">
                    <Label htmlFor="rest">Rest (seconds)</Label>
                    <Input
                      id="rest"
                      type="number"
                      value={rest}
                      onChange={(e) => setRest(e.target.value)}
                    />
                  </div>
                )}
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