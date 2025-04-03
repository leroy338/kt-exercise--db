"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock } from "lucide-react"
import Link from "next/link"
import { getUserTimezone, getStartOfDay, getEndOfDay, convertToUserTimezone } from "@/utils/date"
import type { Database } from "@/types/database.types"

type ScheduledWorkout = Database['public']['Tables']['scheduled_workouts']['Row'] & {
  template: {
    name: string
    type: string
    template: {
      sections: {
        name: string
        exercises: {
          name: string
          sets: number
          reps: number
          rest: number
        }[]
      }[]
    }
  } | null
}

export function TodaysWorkouts() {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTodaysWorkouts() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user's timezone
        const timezone = await getUserTimezone()
        const now = new Date()
        
        // Get start and end of today in user's timezone
        const startOfToday = getStartOfDay(now, timezone)
        const endOfToday = getEndOfDay(now, timezone)

        console.log('Fetching workouts:', {
          userId: user.id,
          timezone,
          startOfToday: startOfToday.toISOString(),
          endOfToday: endOfToday.toISOString(),
          currentTime: new Date().toISOString()
        })

        // Query scheduled_workouts table with exact schema match
        const { data, error } = await supabase
          .from('scheduled_workouts')
          .select(`
            *,
            template:templates (
              id,
              name,
              type,
              template
            )
          `)
          .eq('user_id', user.id)
          .gte('scheduled_for', startOfToday.toISOString())
          .lte('scheduled_for', endOfToday.toISOString())

        if (error) {
          console.error('Error fetching workouts:', error)
          return
        }

        console.log('Raw database response:', data)

        // Convert the scheduled_for dates back to user's timezone for display
        const workoutsInUserTimezone = data.map(workout => ({
          ...workout,
          scheduled_for: new Date(workout.scheduled_for).toISOString()
        }))

        console.log('Processed workouts:', workoutsInUserTimezone)
        setWorkouts(workoutsInUserTimezone)
      } catch (error) {
        console.error('Error in fetchTodaysWorkouts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysWorkouts()

    // Refresh workouts every minute
    const interval = setInterval(fetchTodaysWorkouts, 60000)
    return () => clearInterval(interval)
  }, [supabase])

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">Loading workouts...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's Workouts</h2>
          <span className="text-sm text-emerald-700">
            {format(new Date(), 'EEEE, MMMM d')}
          </span>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">No workouts scheduled for today</p>
        </div>
      ) : (
        <div className="divide-y">
          {workouts.map((workout) => (
            <Link 
              key={workout.id} 
              href={`/protected/workout/start/${workout.id}`}
              className="block hover:bg-muted/50 transition-colors"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{workout.template?.name}</h3>
                    <p className="text-sm text-muted-foreground">{workout.template?.type}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {workout.start_time && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-4 w-4" />
                        {format(new Date(workout.start_time), 'h:mm a')}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Exercise Preview */}
                <div className="mt-3 space-y-1">
                  {workout.template?.template.sections.map((section, idx) => (
                    <div key={idx} className="text-sm">
                      {section.exercises.map((exercise, exerciseIdx) => (
                        <div 
                          key={exerciseIdx}
                          className="text-muted-foreground"
                        >
                          {exercise.name} ({exercise.sets}×{exercise.reps})
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Action Button */}
      <div className="p-4 sm:p-6 border-t bg-muted/50">
        <Button 
          asChild 
          variant="outline" 
          className="w-full"
        >
          <Link href="/protected/workout/schedule">
            Schedule New Workout
          </Link>
        </Button>
      </div>
    </Card>
  )
}
