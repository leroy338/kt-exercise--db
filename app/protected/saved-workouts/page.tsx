"use client"

import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { muscleGroups } from "@/app/config/muscle-groups"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { workoutTypes } from "@/app/config/workout-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as React from "react"

interface SavedWorkout {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
    muscle_group: string
  }[]
  created_at: string
  count: number
}

interface Exercise {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
    muscle_group: string
  }[]
  created_at: string
}

export default function SavedWorkouts() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 10
  const [expandedTableWorkoutId, setExpandedTableWorkoutId] = useState<number | null>(null)
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast({
            title: "Not authenticated",
            description: "Please sign in to view your workouts",
            variant: "destructive"
          })
          router.push('/sign-in')
          return
        }

        // Get all workouts first
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            rest,
            muscle_group,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (workoutsError) throw workoutsError;

        // Group workouts in JavaScript
        const workoutMap = workoutsData.reduce((acc, exercise) => {
          if (!acc.has(exercise.workout_id)) {
            acc.set(exercise.workout_id, {
              workout_id: exercise.workout_id,
              workout_name: exercise.workout_name,
              workout_type: exercise.workout_type,
              created_at: exercise.created_at,
              exercises: [],
              count: 0
            });
          }
          
          const workout = acc.get(exercise.workout_id)!;
          workout.exercises.push({
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            muscle_group: exercise.muscle_group
          });
          workout.count++;
          
          return acc;
        }, new Map());

        // Convert to array and take first 6
        const combinedWorkouts = Array.from(workoutMap.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6);

        setWorkouts(combinedWorkouts);

        // For the exercise history table with pagination
        const { data: tableWorkoutsData, error: tableError } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            rest,
            muscle_group,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, (page * ITEMS_PER_PAGE) - 1);

        if (tableError) throw tableError;

        // Get total count for pagination
        const { count } = await supabase
          .from('saved_workouts')
          .select('workout_id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        setTotalCount(count || 0);

        // Group table workouts using the same logic
        const tableWorkoutMap = tableWorkoutsData.reduce((acc, exercise) => {
          if (!acc.has(exercise.workout_id)) {
            acc.set(exercise.workout_id, {
              workout_id: exercise.workout_id,
              workout_name: exercise.workout_name,
              workout_type: exercise.workout_type,
              created_at: exercise.created_at,
              exercises: []
            });
          }
          
          const workout = acc.get(exercise.workout_id)!;
          workout.exercises.push({
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            muscle_group: exercise.muscle_group
          });
          
          return acc;
        }, new Map());

        const tableWorkouts = Array.from(tableWorkoutMap.values());
        setExercises(tableWorkouts);
      } catch (error) {
        const err = error as Error
        console.error('Unexpected error:', err.message)
        toast({
          title: "Error",
          description: "Failed to load workouts: " + err.message,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [router, supabase, toast])

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/protected/workout/start/${workoutId}`)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentWorkoutIndex(prev => Math.max(0, prev - 1))
    } else {
      setCurrentWorkoutIndex(prev => Math.min(workouts.length - 1, prev + 1))
    }
  }

  const handleCardClick = (workoutId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setExpandedWorkoutId(expandedWorkoutId === workoutId ? null : workoutId);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-full">
        <h1 className="text-2xl font-bold mb-6">Recent Workouts</h1>
        
        <div className="relative px-2 md:px-4">
          <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4">
              {workouts.slice(currentWorkoutIndex, currentWorkoutIndex + 1).map((workout) => (
                <Card 
                  key={`workout-${workout.workout_id}`}
                  className="p-2 md:p-4 hover:bg-muted/50 transition-colors shrink-0 w-[85vw] md:w-[calc(100vw-3rem)]"
                  onClick={(e) => handleCardClick(workout.workout_id, e)}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div>
                      <h3 className="font-semibold truncate text-[13px] md:text-base">{workout.workout_name}</h3>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Badge variant="outline" className="text-[11px] md:text-sm">
                          {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                        </Badge>
                        <span className="text-[11px] md:text-sm text-muted-foreground">
                          {workout.count} exercises • {new Date(workout.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleStartWorkout(workout.workout_id)}
                      className="shrink-0 h-8 w-8 md:h-10 md:w-10"
                    >
                      <Play className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 md:gap-2 mb-1 md:mb-2">
                    {Array.from(new Set(workout.exercises.map(e => e.muscle_group))).map(group => (
                      <Badge key={group} variant="secondary" className="text-[11px] md:text-sm">
                        {muscleGroups.find(g => g.id === group)?.label}
                      </Badge>
                    ))}
                  </div>

                  {expandedWorkoutId === workout.workout_id && (
                    <div className="mt-2 md:mt-4 space-y-1 md:space-y-2 border-t pt-2 md:pt-4">
                      {workout.exercises.map((exercise, index) => (
                        <div 
                          key={`${workout.workout_id}-${exercise.exercise_name}-${index}`}
                          className="flex justify-between items-center text-[11px] md:text-sm"
                        >
                          <span className="font-medium">{exercise.exercise_name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>

          {workouts.length > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md"
                onClick={() => scroll('left')}
                disabled={currentWorkoutIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md"
                onClick={() => scroll('right')}
                disabled={currentWorkoutIndex === workouts.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="mt-12">
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Exercise History</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? "secondary" : "outline"}
                onClick={() => setSelectedType(null)}
                size="sm"
              >
                All
              </Button>
              {workoutTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "secondary" : "outline"}
                  onClick={() => setSelectedType(type.id)}
                  size="sm"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Workout Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Exercise Count</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises
                  .filter(workout => !selectedType || workout.workout_type === selectedType)
                  .map((workout) => (
                    <React.Fragment key={`workout-row-${workout.workout_id}-${workout.created_at}`}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedTableWorkoutId(
                          expandedTableWorkoutId === workout.workout_id ? null : workout.workout_id
                        )}
                      >
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {workout.workout_name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {workout.exercises.length} exercises
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {expandedTableWorkoutId === workout.workout_id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                      </TableRow>

                      {expandedTableWorkoutId === workout.workout_id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/50 p-0">
                            <div className="divide-y divide-border">
                              {workout.exercises.map((exercise, index) => (
                                <div 
                                  key={`${workout.workout_id}-exercise-${index}`}
                                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-4 text-[11px] sm:text-sm"
                                >
                                  <div className="font-medium truncate">{exercise.exercise_name}</div>
                                  <div className="text-muted-foreground truncate">
                                    {muscleGroups.find(g => g.id === exercise.muscle_group)?.label}
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    {exercise.sets} sets
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    {exercise.reps} reps
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
