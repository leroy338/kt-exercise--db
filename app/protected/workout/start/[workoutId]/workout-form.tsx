"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tables } from "@/types/database.types"

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
}

interface Section {
  name: string
  exercises: Exercise[]
}

interface Template {
  id: number
  name: string
  type: string
  template: {
    sections: Section[]
  }
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

  if (loading) return <div className="p-6">Loading...</div>
  if (!template) return <div className="p-6">Workout not found</div>

  const currentSection = template.template.sections[currentSectionIndex]
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
            <h1 className="text-2xl font-bold mb-4">{template.name}</h1>
            {!isStarted ? (
              <Button 
                onClick={handleStart} 
                className="w-full"
                size="lg"
              >
                Start Workout
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{currentSection.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    Exercise {currentExerciseNumber} of {totalExercises}
                  </div>
                </div>

                <Progress value={progress} />

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{currentExercise.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Target: {currentExercise.sets} sets × {currentExercise.reps} reps
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentExercise.completedSets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-3 gap-4">
                        <div className="flex items-center">
                          Set {set.set_number}
                        </div>
                        <Input
                          type="number"
                          placeholder="Weight (lbs)"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(
                            setIndex,
                            'weight',
                            Number(e.target.value)
                          )}
                        />
                        <Input
                          type="number"
                          placeholder={`Reps (target: ${currentExercise.reps})`}
                          value={set.reps_completed || ''}
                          onChange={(e) => updateSet(
                            setIndex,
                            'reps_completed',
                            Number(e.target.value)
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button
                    onClick={previousExercise}
                    disabled={currentSectionIndex === 0 && currentExerciseIndex === 0}
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentSectionIndex === template.template.sections.length - 1 && 
                   currentExerciseIndex === currentSection.exercises.length - 1 ? (
                    <Button onClick={handleComplete}>
                      Complete Workout
                    </Button>
                  ) : (
                    <Button onClick={nextExercise}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
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
                  <h3 className="font-medium">{section.name}</h3>
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
                          {exercise.sets} × {exercise.reps}
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