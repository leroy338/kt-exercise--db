"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ExerciseSelector } from "@/app/protected/exercise-selector"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { Drawer } from "vaul"
import { useState } from "react"
import { exercises as exercisesList } from "@/app/config/exercises"
import { Exercise } from "@/app/config/exercises"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { muscleGroups as muscleGroupConfig } from "@/app/config/muscle-groups"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

function WorkoutBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workoutTypeId = searchParams.get('type')
  const muscleGroups = searchParams.get('muscles')?.split(',') || []
  const { toast } = useToast()
  const supabase = createClient()

  // Builder state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: '',
    type: workoutTypeId || '',
    muscleGroups: [],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<string[]>(muscleGroups)
  const [workoutName, setWorkoutName] = useState("")

  const toggleMuscleFilter = (groupId: string) => {
    setSelectedMuscleFilters(prev => {
      const isSelected = prev.includes(groupId)
      return isSelected
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    })
  }

  const handleSubmitExercise = () => {
    if (editingIndex !== null) {
      setExercises(prev => prev.map((ex, i) => 
        i === editingIndex ? currentExercise : ex
      ))
    } else {
      setExercises([...exercises, currentExercise])
    }
    setCurrentExercise({
      name: '',
      type: workoutTypeId || '',
      muscleGroups: [],
      defaultSets: 3,
      defaultReps: 10,
      defaultRest: 60
    })
    setEditingIndex(null)
    setIsDrawerOpen(false)
  }

  const handleEditExercise = (exercise: Exercise, index: number) => {
    setCurrentExercise(exercise)
    setEditingIndex(index)
    setIsDrawerOpen(true)
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  // Filter exercises based on selected muscle groups
  const filteredExercises = exercisesList.filter(exercise => 
    exercise.type === workoutTypeId
  )

  // Add this helper function to group exercises by muscle groups
  const groupExercisesByMuscle = (exercises: Exercise[]) => {
    const groups = new Map<string, Exercise[]>()
    
    // If no filters selected, use all muscle groups
    const muscleGroupsToUse = selectedMuscleFilters.length > 0 
      ? selectedMuscleFilters 
      : muscleGroupConfig.map(g => g.id)
    
    muscleGroupsToUse.forEach(muscleId => {
      const muscleGroup = muscleGroupConfig.find(g => g.id === muscleId)
      if (muscleGroup) {
        const exercisesForMuscle = exercises.filter(exercise => 
          exercise.type === workoutTypeId &&
          exercise.muscleGroups.includes(muscleId)
        )
        if (exercisesForMuscle.length > 0) {
          groups.set(muscleId, exercisesForMuscle)
        }
      }
    })
    
    return groups
  }

  const handleCreateWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to create workouts",
          variant: "destructive"
        })
        return
      }

      // Get the next workout ID
      const { data: maxWorkout } = await supabase
        .from('saved_workouts')
        .select('workout_id')
        .order('workout_id', { ascending: false })
        .limit(1)
        .single()

      const workoutId = (maxWorkout?.workout_id || 0) + 1

      // Insert all exercises as separate rows
      const { error } = await supabase
        .from('saved_workouts')
        .insert(
          exercises.map(exercise => ({
            workout_id: workoutId,
            workout_name: workoutName,
            workout_type: workoutTypeId,
            exercise_name: exercise.name,
            sets: exercise.defaultSets,
            reps: exercise.defaultReps,
            rest: exercise.defaultRest,
            muscle_group: exercise.muscleGroups[0], // Take first muscle group
            user_id: user.id,
            created_at: new Date().toISOString()
          }))
        )

      if (error) throw error

      toast({
        title: "Workout Created",
        description: `${workoutName} has been saved successfully.`
      })
      
      router.push('/protected/saved-workouts')
    } catch (err) {
      console.error('Error saving workout:', err)
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive"
      })
    }
  }

  // If no type selected, show the exercise selector
  if (!workoutTypeId) {
    return <ExerciseSelector />
  }

  return (
    <div>
      {/* Main Header */}
      <div className="border-b">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <h2 className="text-lg font-semibold">Workout Builder</h2>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Header */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Top Row - X and Create */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/protected/workout-builder')}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="lg"
                disabled={exercises.length === 0 || !workoutName.trim()}
                onClick={handleCreateWorkout}
              >
                Create Workout
              </Button>
            </div>

            {/* Second Row - Name and Badges */}
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter workout name..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="text-center text-lg"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {muscleGroups.map(groupId => {
                  const group = muscleGroupConfig.find(g => g.id === groupId)
                  return group ? (
                    <Badge key={groupId} variant="secondary">
                      {group.label}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </div>

          {/* Add Exercise Button Row */}
          <div className="flex mb-6">
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              size="lg"
              variant="ghost"
              className="min-w-[200px] border hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {/* Selected Exercises */}
          <div>
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exercise.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{exercise.defaultSets} sets</Badge>
                        <Badge variant="secondary">{exercise.defaultReps} reps</Badge>
                        <Badge variant="secondary">{exercise.defaultRest}s rest</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditExercise(exercise, index)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Exercise drawer */}
          <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="bg-background fixed bottom-0 left-0 right-0 rounded-t-[10px] flex flex-col lg:left-[240px] h-[60vh]">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
                <div className="p-6 flex-1 overflow-auto">
                  <Drawer.Title className="text-lg font-semibold mb-6">
                    {editingIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
                  </Drawer.Title>

                  {/* Exercise Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="name">Exercise Name</Label>
                      <Input
                        id="name"
                        value={currentExercise.name}
                        onChange={(e) => setCurrentExercise({
                          ...currentExercise,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sets">Sets</Label>
                        <Input
                          id="sets"
                          type="number"
                          value={currentExercise.defaultSets}
                          onChange={(e) => setCurrentExercise({
                            ...currentExercise,
                            defaultSets: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reps">Reps</Label>
                        <Input
                          id="reps"
                          type="number"
                          value={currentExercise.defaultReps}
                          onChange={(e) => setCurrentExercise({
                            ...currentExercise,
                            defaultReps: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rest">Rest (seconds)</Label>
                      <Input
                        id="rest"
                        type="number"
                        value={currentExercise.defaultRest}
                        onChange={(e) => setCurrentExercise({
                          ...currentExercise,
                          defaultRest: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleSubmitExercise}
                      disabled={!currentExercise.name}
                    >
                      {editingIndex !== null ? 'Update Exercise' : 'Add Exercise'}
                    </Button>
                  </div>

                  {/* Muscle Group Filter */}
                  <div className="mb-6">
                    <Label className="mb-2 block">Filter by Muscle Group</Label>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroupConfig.map(group => (
                        <Badge
                          key={group.id}
                          variant={selectedMuscleFilters.includes(group.id) ? "default" : "secondary"}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => toggleMuscleFilter(group.id)}
                        >
                          {group.label}
                          {selectedMuscleFilters.includes(group.id) && (
                            <span className="ml-1 hover:text-destructive">×</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Exercise Cards */}
                  <ScrollArea className="h-[calc(80vh-24rem)]">
                    <div className="space-y-6">
                      {Array.from(groupExercisesByMuscle(filteredExercises)).map(([muscleId, exercises]) => {
                        const muscleGroup = muscleGroupConfig.find(g => g.id === muscleId)
                        return muscleGroup ? (
                          <div key={muscleId}>
                            <h3 className="font-semibold mb-3">{muscleGroup.label} Exercises</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {exercises.map((exercise, index) => (
                                <Card
                                  key={`${muscleId}-${index}`}
                                  className={cn(
                                    "p-3 cursor-pointer hover:bg-accent",
                                    currentExercise.name === exercise.name && "border-primary"
                                  )}
                                  onClick={() => setCurrentExercise({
                                    ...exercise,
                                    defaultSets: currentExercise.defaultSets,
                                    defaultReps: currentExercise.defaultReps,
                                    defaultRest: currentExercise.defaultRest
                                  })}
                                >
                                  <h3 className="font-medium">{exercise.name}</h3>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {exercise.muscleGroups.map(groupId => {
                                      const group = muscleGroupConfig.find(g => g.id === groupId)
                                      return group ? (
                                        <Badge key={groupId} variant="outline" className="text-xs">
                                          {group.label}
                                        </Badge>
                                      ) : null
                                    })}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
    </div>
  )
}

export default function WorkoutBuilder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutBuilderContent />
    </Suspense>
  )
} 