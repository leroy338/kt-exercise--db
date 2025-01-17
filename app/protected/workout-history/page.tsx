"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { muscleGroups } from "@/app/config/muscle-groups"
import { workoutTypes } from "@/app/config/workout-types"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import * as React from "react"

interface WorkoutLog {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
    reps_completed: number
    weight: number
    muscle_group: string
    rest: number
  }[]
  created_at: string
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 10
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkoutLogs() {
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

        const { data, error } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

        if (error) throw error

        // Group by workout_id and created_at
        const groupedWorkouts = data.reduce((acc: { [key: string]: WorkoutLog }, log) => {
          const key = `${log.workout_id}-${log.created_at}`
          if (!acc[key]) {
            acc[key] = {
              workout_id: log.workout_id,
              workout_name: log.workout_name,
              workout_type: log.workout_type,
              created_at: log.created_at,
              exercises: []
            }
          }
          
          acc[key].exercises.push({
            exercise_name: log.exercise_name,
            sets: log.sets,
            reps: log.reps,
            reps_completed: log.reps_completed,
            weight: log.weight,
            muscle_group: log.muscle_group,
            rest: log.rest
          })
          
          return acc
        }, {})

        setWorkouts(Object.values(groupedWorkouts))

        // Get total count for pagination
        const { count } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setTotalCount(count || 0)
        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
      } catch (error) {
        console.error('Error fetching workout logs:', error)
        toast({
          title: "Error",
          description: "Failed to load workout history",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutLogs()
  }, [page, supabase, router, toast])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-6 space-y-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Exercise History</h2>
        
        <div className="flex flex-wrap gap-2 max-w-full pb-2 overflow-x-auto">
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
              <TableHead>Workout Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Exercise Count</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts
              .filter(workout => !selectedType || workout.workout_type === selectedType)
              .map((workout) => (
                <React.Fragment key={`workout-row-${workout.workout_id}-${workout.created_at}`}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedWorkoutId(
                      expandedWorkoutId === workout.workout_id ? null : workout.workout_id
                    )}
                  >
                    <TableCell className="font-medium">
                      {workout.workout_name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {workout.exercises.length} exercises
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(workout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {expandedWorkoutId === workout.workout_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                  </TableRow>

                  {expandedWorkoutId === workout.workout_id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/50 p-4">
                        <div className="space-y-2">
                          {workout.exercises.map((exercise, index) => (
                            <div 
                              key={`${workout.workout_id}-exercise-${index}`}
                              className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded-lg bg-background"
                            >
                              <div className="font-medium">{exercise.exercise_name}</div>
                              <div className="text-muted-foreground">
                                {muscleGroups.find(g => g.id === exercise.muscle_group)?.label}
                              </div>
                              <div className="text-right text-muted-foreground">
                                {exercise.sets} sets × {exercise.reps} reps
                              </div>
                              <div className="text-right text-muted-foreground">
                                {exercise.rest}s rest
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

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
        </div>
        <div className="flex gap-2 order-1 sm:order-2">
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
  )
}