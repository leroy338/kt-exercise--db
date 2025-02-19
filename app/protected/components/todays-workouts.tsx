"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"

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

  if (workouts.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Workouts</h2>
        <p className="text-muted-foreground">No workouts scheduled for today</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Today's Workouts</h2>
      <div className="space-y-4">
        {workouts.map((workout) => (
          <Card key={workout.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{workout.template?.name}</h3>
                <p className="text-sm text-muted-foreground">{workout.template?.type}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {workout.start_time && format(new Date(workout.start_time), 'h:mm a')}
              </div>
            </div>
            <div className="space-y-2">
              {workout.template?.template.sections.map((section, idx) => (
                <div key={idx} className="border-t pt-2 first:border-t-0 first:pt-0">
                  <h4 className="font-medium text-sm">{section.name}</h4>
                  <ul className="mt-1 space-y-1">
                    {section.exercises.map((exercise, exerciseIdx) => (
                      <li key={exerciseIdx} className="text-sm">
                        {exercise.name} - {exercise.sets}x{exercise.reps}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
