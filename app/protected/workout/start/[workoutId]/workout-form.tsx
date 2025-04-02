"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tables } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"

type WorkoutLog = Tables<'workout_logs'>

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  completedSets: {
    set_number: number
    reps_completed: number
    weight: number
  }[]
  duration?: number // For circuit workouts
}

interface Section {
  name: string
  exercises: Exercise[]
  type?: string // Add section type
}

interface Template {
  id: number
  name: string
  type: string
  template: {
    sections: Section[]
  }
}

function CircuitPlayer({ 
  exercise, 
  onComplete, 
  onNext 
}: { 
  exercise: Exercise
  onComplete: () => void
  onNext: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(exercise.duration || 30)
  const [isRest, setIsRest] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(exercise.rest || 15)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isActive) {
      if (isRest) {
        timer = setInterval(() => {
          setRestTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRest(false)
              setTimeLeft(exercise.duration || 30)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRest(true)
              setRestTimeLeft(exercise.rest || 15)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }
    return () => clearInterval(timer)
  }, [isActive, isRest, exercise.duration, exercise.rest])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsRest(false)
    setTimeLeft(exercise.duration || 30)
    setRestTimeLeft(exercise.rest || 15)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{exercise.name}</h3>
        <div className="text-sm text-muted-foreground">
          {isRest ? 'Rest' : 'Work'} Time
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-bold">
          {isRest ? restTimeLeft : timeLeft}
        </div>
        <div className="text-sm text-muted-foreground">
          {isRest ? 'Rest' : 'Work'} Period
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={toggleTimer}
          className="w-32"
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outline"
          onClick={resetTimer}
          className="w-32"
        >
          Reset
        </Button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={onComplete}
          className="w-32"
        >
          Complete
        </Button>
        <Button
          onClick={onNext}
          className="w-32"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function SetsPlayer({ 
  exercise, 
  completedSets, 
  onUpdateSet, 
  onNext, 
  onPrevious 
}: { 
  exercise: Exercise
  completedSets: Exercise['completedSets']
  onUpdateSet: (setIndex: number, field: string, value: number) => void
  onNext: () => void
  onPrevious: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{exercise.name}</h3>
        <div className="text-sm text-muted-foreground">
          Target: {exercise.sets} sets × {exercise.reps} reps
        </div>
      </div>

      <div className="space-y-4">
        {completedSets.map((set, setIndex) => (
          <div key={setIndex} className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              Set {set.set_number}
            </div>
            <Input
              type="number"
              placeholder="Weight (lbs)"
              value={set.weight || ''}
              onChange={(e) => onUpdateSet(
                setIndex,
                'weight',
                Number(e.target.value)
              )}
            />
            <Input
              type="number"
              placeholder={`Reps (target: ${exercise.reps})`}
              value={set.reps_completed || ''}
              onChange={(e) => onUpdateSet(
                setIndex,
                'reps_completed',
                Number(e.target.value)
              )}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
        >
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

function CircuitWorkoutPlayer({ 
  template, 
  currentSectionIndex, 
  currentExerciseIndex, 
  onNext, 
  onPrevious, 
  onComplete,
  onResetToFirstExercise
}: { 
  template: Template, 
  currentSectionIndex: number, 
  currentExerciseIndex: number, 
  onNext: () => void, 
  onPrevious: () => void, 
  onComplete: () => void,
  onResetToFirstExercise: () => void
}) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isRest, setIsRest] = useState(false)
  const [isActive, setIsActive] = useState(true) // Start active by default
  const [completedSets, setCompletedSets] = useState(0)
  const [isLastExercise, setIsLastExercise] = useState(false)
  const [isLastSection, setIsLastSection] = useState(false)
  const [sectionCompleted, setSectionCompleted] = useState(false)
  const [shouldMoveToNext, setShouldMoveToNext] = useState(false)

  const currentSection = template.template.sections[currentSectionIndex]
  const currentExercise = currentSection?.exercises[currentExerciseIndex]
  const totalExercises = currentSection?.exercises.length || 0

  useEffect(() => {
    // Reset state when exercise changes
    if (currentExercise) {
      setTimeLeft(currentExercise.duration || 30)
    } else {
      setTimeLeft(null)
    }
    setIsRest(false)
    setIsActive(true) // Keep active when changing exercises
    setIsLastExercise(currentExerciseIndex === totalExercises - 1)
    setIsLastSection(currentSectionIndex === template.template.sections.length - 1)
    setSectionCompleted(false)
    setShouldMoveToNext(false)
  }, [currentExerciseIndex, currentSectionIndex, totalExercises, template.template.sections.length, currentExercise])

  // Handle moving to next exercise when shouldMoveToNext is true
  useEffect(() => {
    if (shouldMoveToNext) {
      onNext()
      setShouldMoveToNext(false)
    }
  }, [shouldMoveToNext, onNext])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft !== null && currentExercise) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null
          if (prev <= 1) {
            if (isRest) {
              // Rest period finished, start next exercise or set
              setIsRest(false)
              if (isLastExercise) {
                // Last exercise completed, mark section as completed
                setSectionCompleted(true)
                return null
              } else {
                // Move to next exercise
                setShouldMoveToNext(true)
                return null
              }
            } else {
              // Work period finished, start rest
              setIsRest(true)
              return currentExercise.rest || 15
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isRest, currentExercise, isLastExercise])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const handleNext = () => {
    if (sectionCompleted) {
      if (isLastSection) {
        onComplete()
      } else {
        onNext()
      }
    } else {
      // Move to the next exercise
      onNext()
    }
  }

  const handleAddSet = () => {
    // Increment the completed sets counter
    setCompletedSets(prev => prev + 1)
    
    // Reset to the first exercise in the section
    // Reset the timer for the first exercise
    if (currentSection?.exercises[0]) {
      setTimeLeft(currentSection.exercises[0].duration || 30)
    }
    
    setIsRest(false)
    setIsActive(true)
    setSectionCompleted(false)
    
    // Call onResetToFirstExercise to reset to the first exercise in the section
    onResetToFirstExercise()
  }

  if (!currentExercise) {
    return null
  }

  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{currentSection.name}</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </div>
          <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
            Set {completedSets + 1}
          </div>
        </div>
      </div>

      <Progress value={progress} />

      <div className="text-center">
        <h3 className="text-2xl font-bold">{currentExercise.name}</h3>
        <p className="text-muted-foreground">
          {currentExercise.duration || 30}s work / {currentExercise.rest || 15}s rest
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-bold">
          {timeLeft !== null ? timeLeft : '--'}
        </div>
        <div className="flex items-center gap-2">
          {isRest ? (
            <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-md text-sm font-medium">
              Rest Period
            </div>
          ) : (
            <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-sm font-medium">
              Work Period
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={toggleTimer}
          className="w-32"
        >
          {isActive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="w-32"
          size="lg"
        >
          Previous
        </Button>
        {sectionCompleted ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleNext}
              className="w-40"
              size="lg"
              variant="outline"
            >
              {isLastSection ? "Complete Workout" : "Next Section"}
            </Button>
            <Button 
              onClick={handleAddSet}
              className="w-40"
              size="lg"
            >
              Add a Set
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleNext}
            className="w-40"
            size="lg"
          >
            Next Exercise
          </Button>
        )}
      </div>
    </div>
  )
}

export function WorkoutForm({ workoutId }: { workoutId: string }) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchTemplate() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (error) {
        console.error('Error fetching template:', error)
        return
      }

      if (data) {
        // Add completedSets array to each exercise
        const templateWithSets = {
          ...data,
          template: {
            sections: data.template.sections.map((section: Section) => ({
              ...section,
              exercises: section.exercises.map((exercise: Exercise) => ({
                ...exercise,
                completedSets: Array.from({ length: exercise.sets }, (_, i) => ({
                  set_number: i + 1,
                  reps_completed: 0,
                  weight: 0
                }))
              }))
            }))
          }
        }
        setTemplate(templateWithSets)
      }
      setLoading(false)
    }

    fetchTemplate()
  }, [workoutId, supabase])

  const updateSet = (setIndex: number, field: string, value: number) => {
    if (!template) return

    const newTemplate = { ...template }
    const currentExercise = newTemplate.template.sections[currentSectionIndex].exercises[currentExerciseIndex]
    currentExercise.completedSets[setIndex] = {
      ...currentExercise.completedSets[setIndex],
      [field]: value
    }
    setTemplate(newTemplate)
  }

  const handleStart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to start workouts",
          variant: "destructive"
        })
        return
      }

      setIsStarted(true)
      toast({
        title: "Workout Started",
        description: "Good luck with your workout!"
      })
    } catch (err) {
      console.error('Error starting workout:', err)
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive"
      })
    }
  }

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to log workouts",
          variant: "destructive"
        })
        return
      }

      // Insert workout logs using the correct types
      const { error } = await supabase
        .from('workout_logs')
        .insert(
          template!.template.sections.flatMap(section =>
            section.exercises.flatMap(exercise =>
              exercise.completedSets.map(set => ({
                user_id: user.id,
                workout_id: parseInt(workoutId),
                workout_name: template!.name,
                workout_type: template!.type,
                exercise_name: exercise.name,
                muscle_group: exercise.muscleGroups[0], // Using first muscle group
                weight: set.weight,
                reps_completed: set.reps_completed,
                sets: exercise.sets,
                reps: exercise.reps,
                rest: exercise.rest,
                created_at: new Date().toISOString()
              } satisfies Omit<WorkoutLog, 'id'>))
            )
          )
        )

      if (error) throw error

      toast({
        title: "Workout Completed",
        description: "Your workout has been logged successfully."
      })
      
      router.push('/protected/workout-history')
    } catch (err) {
      console.error('Error completing workout:', err)
      toast({
        title: "Error",
        description: "Failed to complete workout",
        variant: "destructive"
      })
    }
  }

  const nextExercise = () => {
    if (!template) return

    const currentSection = template.template.sections[currentSectionIndex]
    if (currentExerciseIndex < currentSection.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else if (currentSectionIndex < template.template.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentExerciseIndex(0)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSection = template!.template.sections[currentSectionIndex - 1]
      setCurrentExerciseIndex(prevSection.exercises.length - 1)
    }
  }

  const isCircuitSection = (section: Section) => {
    return section.type === 'circuit' || section.type === 'wod' || section.type === 'hiit' || section.type === 'tabata'
  }

  const currentSection = template?.template.sections[currentSectionIndex]
  const isCircuit = currentSection && isCircuitSection(currentSection)

  const isCircuitWorkout = template?.type === 'circuit' || 
                          template?.type === 'wod' || 
                          template?.type === 'hiit' || 
                          template?.type === 'tabata'

  const resetToFirstExercise = () => {
    setCurrentExerciseIndex(0)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!template) return <div className="p-6">Workout not found</div>
  if (!currentSection) return <div className="p-6">Section not found</div>

  const currentExercise = currentSection.exercises[currentExerciseIndex]
  const totalExercises = template.template.sections.reduce(
    (acc, section) => acc + section.exercises.length, 0
  )
  const currentExerciseNumber = template.template.sections
    .slice(0, currentSectionIndex)
    .reduce((acc, section) => acc + section.exercises.length, 0) + currentExerciseIndex + 1
  const progress = (currentExerciseNumber / totalExercises) * 100

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Input Area */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{template?.name}</h1>
            </div>
            {!isStarted ? (
              <Button 
                onClick={handleStart} 
                className="w-full"
                size="lg"
              >
                Start Workout
              </Button>
            ) : (
              isCircuitWorkout ? (
                <CircuitWorkoutPlayer
                  template={template}
                  currentSectionIndex={currentSectionIndex}
                  currentExerciseIndex={currentExerciseIndex}
                  onNext={nextExercise}
                  onPrevious={previousExercise}
                  onComplete={handleComplete}
                  onResetToFirstExercise={resetToFirstExercise}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{currentSection.name}</h2>
                    <div className="text-sm text-muted-foreground">
                      Exercise {currentExerciseNumber} of {totalExercises}
                    </div>
                  </div>

                  <Progress value={progress} />

                  <SetsPlayer
                    exercise={currentExercise}
                    completedSets={currentExercise.completedSets}
                    onUpdateSet={updateSet}
                    onNext={nextExercise}
                    onPrevious={previousExercise}
                  />
                </div>
              )
            )}
          </Card>
        </div>

        {/* Right Column - Template Overview */}
        <div className="lg:w-1/3">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Workout Overview</h2>
            <div className="space-y-4">
              {template.template.sections.map((section, sIndex) => (
                <div 
                  key={sIndex} 
                  className={`space-y-2 ${
                    isStarted && sIndex === currentSectionIndex ? 'bg-muted/50 p-2 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{section.name}</h3>
                    {isCircuitSection(section) && (
                      <Badge variant="outline">Circuit</Badge>
                    )}
                  </div>
                  {section.exercises.map((exercise, eIndex) => (
                    <div 
                      key={`${sIndex}-${eIndex}`} 
                      className={`p-2 rounded-lg ${
                        isStarted && 
                        sIndex === currentSectionIndex && 
                        eIndex === currentExerciseIndex 
                          ? 'bg-primary/10' 
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`${
                          isStarted && 
                          ((sIndex < currentSectionIndex) || 
                           (sIndex === currentSectionIndex && eIndex < currentExerciseIndex))
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}>
                          {exercise.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {isCircuitSection(section) 
                            ? `${exercise.duration}s / ${exercise.rest}s rest`
                            : `${exercise.sets} × ${exercise.reps}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 