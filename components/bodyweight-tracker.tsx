"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface ExerciseSet {
  reps?: number
  duration?: number // in seconds
  timestamp: Date
}

interface Exercise {
  name: string
  sets: ExerciseSet[]
  type: "reps" | "duration"
  unit: string
}

export function BodyweightTracker() {
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null)
  const { width, height } = cardRef ? {
    width: cardRef.offsetWidth,
    height: cardRef.offsetHeight
  } : { width: 0, height: 0 }

  const [exercises] = useState<Exercise[]>([
    { name: "Push-ups", sets: [], type: "reps", unit: "reps" },
    { name: "Sit-ups", sets: [], type: "reps", unit: "reps" },
    { name: "Squats", sets: [], type: "reps", unit: "reps" },
    { name: "Pull-ups", sets: [], type: "reps", unit: "reps" },
    { name: "Plank", sets: [], type: "duration", unit: "seconds" },
    { name: "Dead Hang", sets: [], type: "duration", unit: "seconds" },
  ])

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [currentValue, setCurrentValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isConfetti, setIsConfetti] = useState(false)

  const handleSubmit = (exercise: Exercise) => {
    const value = parseInt(currentValue)
    if (isNaN(value) || value <= 0) return

    // Trigger confetti first
    setIsConfetti(true)
    setTimeout(() => setIsConfetti(false), 5000)

    // Then update the exercise state
    const newSet: ExerciseSet = {
      timestamp: new Date(),
      ...(exercise.type === "reps" ? { reps: value } : { duration: value }),
    }

    exercise.sets.push(newSet)
    setCurrentValue("")
  }

  const getTotalReps = (exercise: Exercise) => {
    if (exercise.type === "reps") {
      return exercise.sets.reduce((total, set) => total + (set.reps || 0), 0)
    }
    return exercise.sets.reduce((total, set) => total + (set.duration || 0), 0)
  }

  return (
    <>
      <Card 
        className="w-full max-w-4xl mx-auto relative overflow-hidden" 
        ref={setCardRef}
      >
        {isConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.3}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
        <CardHeader className="pb-4">
          <CardTitle>Bodyweight Exercise Tracker</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Exercise List */}
          <div className="w-full space-y-1">
            {exercises.map((exercise) => (
              <div
                key={exercise.name}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer ${
                  selectedExercise?.name === exercise.name ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-[4.5rem] justify-center whitespace-nowrap">
                    {getTotalReps(exercise)} {exercise.unit}
                  </Badge>
                  <span className="font-medium">{exercise.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedExercise(exercise)
                    handleSubmit(exercise)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Quick Add Form */}
          {selectedExercise && (
            <div className="space-y-1.5">
              <Label>Quick Add {selectedExercise.name}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Enter ${selectedExercise.unit}`}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                />
                <Button onClick={() => handleSubmit(selectedExercise)}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Recent Sets Dropdown */}
          {selectedExercise && selectedExercise.sets.length > 0 && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="border rounded-md"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-accent rounded-md">
                <h4 className="font-medium">Recent Sets</h4>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-1 p-3">
                    {selectedExercise.sets
                      .slice()
                      .reverse()
                      .map((set, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedExercise.name}:</span>
                            <Badge variant="secondary" className="whitespace-nowrap">
                              {selectedExercise.type === "reps"
                                ? set.reps
                                : set.duration}{" "}
                              {selectedExercise.unit}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {set.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </>
  )
} 