"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Exercise {
  exercise_name: string
  sets: number
  reps: number
  muscle_group: string
}

interface WorkoutDetails {
  workout_name: string
  workout_type: string
  exercises: Exercise[]
}

export default function ScheduleWorkout({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = use(params)
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [workout, setWorkout] = useState<WorkoutDetails | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchWorkoutDetails() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_workouts')
        .select(`
          workout_name,
          workout_type,
          exercise_name,
          sets,
          reps,
          muscle_group
        `)
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch workout details",
          variant: "destructive"
        })
        return
      }

      if (data.length === 0) {
        setWorkout(null)
        setLoading(false)
        return
      }

      // Group exercises
      const workoutDetails: WorkoutDetails = {
        workout_name: data[0].workout_name,
        workout_type: data[0].workout_type,
        exercises: data.map(exercise => ({
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          muscle_group: exercise.muscle_group
        }))
      }

      setWorkout(workoutDetails)
      setLoading(false)
    }

    fetchWorkoutDetails()
  }, [workoutId, supabase, toast])

  const handleSchedule = async () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to schedule workouts",
          variant: "destructive"
        })
        return
      }

      // Combine date and time
      const scheduledDateTime = new Date(date)
      const [hours, minutes] = time.split(':')
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))

      const { error } = await supabase
        .from('scheduled_workouts')
        .insert({
          user_id: user.id,
          workout_id: parseInt(workoutId),
          scheduled_for: scheduledDateTime.toISOString(),
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Workout scheduled successfully"
      })
      
      router.push('/protected/planner')
    } catch (error) {
      console.error('Error scheduling workout:', error)
      toast({
        title: "Error",
        description: "Failed to schedule workout",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!workout) return <div className="p-6">Workout not found</div>

  // Generate time slots every 30 minutes
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-6">
      {/* Workout Details Card */}
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{workout?.workout_name}</h1>
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Exercises</h2>
            <div className="space-y-2">
              {workout?.exercises.map((exercise, index) => (
                <div 
                  key={`${exercise.exercise_name}-${index}`}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium">{exercise.exercise_name}</span>
                  <span className="text-muted-foreground">
                    {exercise.sets} × {exercise.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Card */}
      <Card className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-bold mb-6">Schedule Workout</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Time</label>
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSchedule} 
            className="w-full"
            disabled={!date || !time}
          >
            Schedule Workout
          </Button>
        </div>
      </Card>
    </div>
  )
} 