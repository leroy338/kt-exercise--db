"use client"

import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { muscleGroups } from "@/app/config/muscle-groups"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { workoutTypes } from "@/app/config/workout-types"

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

export default function SavedWorkouts() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

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

        const { data: workoutsData, error: workoutsError } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            muscle_group,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (workoutsError) throw workoutsError;

        // Group workouts
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

        const combinedWorkouts = Array.from(workoutMap.values());
        setWorkouts(combinedWorkouts);
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

  const handleScheduleWorkout = (workoutId: number) => {
    router.push(`/protected/workout/schedule/${workoutId}`)
  }

  const handleCardClick = (workoutId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setExpandedWorkoutId(expandedWorkoutId === workoutId ? null : workoutId);
  };

  const recentWorkouts = workouts.slice(0, 3) // Get the 3 most recent workouts
  const remainingWorkouts = workouts.slice(3)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      {/* Recent Workouts Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentWorkouts.map((workout) => (
            <Card 
              key={workout.workout_id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={(e) => handleCardClick(workout.workout_id, e)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{workout.workout_name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {workout.count} exercises • {new Date(workout.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleStartWorkout(workout.workout_id)}
                    title="Start Workout"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleScheduleWorkout(workout.workout_id)}
                    title="Schedule Workout"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(new Set(workout.exercises.map(e => e.muscle_group))).map(group => (
                  <Badge key={group} variant="secondary">
                    {muscleGroups.find(g => g.id === group)?.label}
                  </Badge>
                ))}
              </div>

              {expandedWorkoutId === workout.workout_id && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {workout.exercises.map((exercise, index) => (
                    <div 
                      key={`${workout.workout_id}-${exercise.exercise_name}-${index}`}
                      className="flex justify-between items-center text-sm"
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
      </div>

      {/* All Workouts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">All Workouts</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {remainingWorkouts
            .filter(workout => !selectedType || workout.workout_type === selectedType)
            .map((workout) => (
              <Card 
                key={workout.workout_id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={(e) => handleCardClick(workout.workout_id, e)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{workout.workout_name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {workout.count} exercises • {new Date(workout.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleStartWorkout(workout.workout_id)}
                      title="Start Workout"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleScheduleWorkout(workout.workout_id)}
                      title="Schedule Workout"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.from(new Set(workout.exercises.map(e => e.muscle_group))).map(group => (
                    <Badge key={group} variant="secondary">
                      {muscleGroups.find(g => g.id === group)?.label}
                    </Badge>
                  ))}
                </div>

                {expandedWorkoutId === workout.workout_id && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {workout.exercises.map((exercise, index) => (
                      <div 
                        key={`${workout.workout_id}-${exercise.exercise_name}-${index}`}
                        className="flex justify-between items-center text-sm"
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
      </div>
    </div>
  )
}
