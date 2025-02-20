"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock } from "lucide-react"
import Link from "next/link"

interface ScheduledWorkout {
  id: string
  scheduled_for: string
  start_time: string | null
  end_time: string | null
  template_id: number | null
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
  }
}

export function TodaysWorkouts() {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([])
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function fetchTodaysWorkouts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          *,
          template:templates (
            name,
            type,
            template
          )
        `)
        .eq('user_id', user.id)
        .eq('scheduled_for', today)
        .order('start_time')

      if (error) {
        console.error('Error fetching workouts:', error)
        return
      }

      setWorkouts(data)
    }

    fetchTodaysWorkouts()
  }, [supabase, today])

  return (
    <Card className="overflow-hidden">
      {/* Card Header */}
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg font-semibold">Today's Workouts</h2>
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
