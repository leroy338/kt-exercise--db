"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { TemplateSelectorModal, Template } from "@/components/template-selector-modal"

interface WorkoutEvent {
  workout_id: number
  workout_name: string
  workout_type: string
  created_at: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
  }[]
}

interface ScheduledWorkout {
  id: string
  workout_id: number
  scheduled_for: string
}

export default function Planner() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTab, setSelectedTab] = useState("calendar")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workouts, setWorkouts] = useState<WorkoutEvent[]>([])
  const [scheduledDates, setScheduledDates] = useState<Date[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [folders, setFolders] = useState<{name: string, templates: Template[]}[]>([])
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([])
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchScheduledWorkouts()
    fetchTemplates()
  }, [])

  const fetchScheduledWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('scheduled_for')
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase query error:', error)
        return
      }

      if (!data) {
        setScheduledDates([])
        return
      }

      // Convert scheduled_for timestamps to Date objects
      const dates = data.map(item => new Date(item.scheduled_for))
      setScheduledDates(dates)
    } catch (error) {
      console.error('Error in fetchScheduledWorkouts:', error)
      toast({
        title: "Error",
        description: "Failed to load scheduled workouts",
        variant: "destructive"
      })
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_workouts')
        .select(`
          workout_id,
          workout_name,
          workout_type,
          exercise_name,
          sets,
          reps,
          muscle_group,
          created_at,
          folder
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group exercises by workout_id
      const templateMap = new Map<number, Template>()
      data.forEach(row => {
        if (!templateMap.has(row.workout_id)) {
          templateMap.set(row.workout_id, {
            workout_id: row.workout_id,
            workout_name: row.workout_name,
            workout_type: row.workout_type,
            created_at: row.created_at,
            folder: row.folder,
            exercises: [],
            count: 0
          })
        }
        const template = templateMap.get(row.workout_id)
        if (template) {
          template.exercises.push({
            exercise_name: row.exercise_name,
            sets: row.sets,
            reps: row.reps,
            muscle_group: row.muscle_group
          })
          template.count = template.exercises.length
        }
      })

      setTemplates(Array.from(templateMap.values()))
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      })
    }
  }

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      await fetchWorkoutsForDate(selectedDate)
      setIsModalOpen(true)
    }
  }

  const fetchWorkoutsForDate = async (selectedDate: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      // First get scheduled workouts for this day
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          workout_id,
          scheduled_for
        `)
        .eq('user_id', user.id)
        .gte('scheduled_for', startOfDay.toISOString())
        .lte('scheduled_for', endOfDay.toISOString())

      if (scheduledError) throw scheduledError

      // Then get the workout details for each scheduled workout
      const workoutPromises = scheduledData.map(async (schedule) => {
        const { data, error } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            created_at
          `)
          .eq('workout_id', schedule.workout_id)
          .eq('user_id', user.id)

        if (error) throw error
        return { data, scheduledFor: schedule.scheduled_for }
      })

      const workoutResults = await Promise.all(workoutPromises)

      // Group workouts
      const workoutMap = new Map<number, WorkoutEvent>()
      workoutResults.forEach(({ data, scheduledFor }) => {
        data.forEach(row => {
          if (!workoutMap.has(row.workout_id)) {
            workoutMap.set(row.workout_id, {
              workout_id: row.workout_id,
              workout_name: row.workout_name,
              workout_type: row.workout_type,
              created_at: scheduledFor, // Use scheduled time instead of created_at
              exercises: []
            })
          }
          workoutMap.get(row.workout_id)?.exercises.push({
            exercise_name: row.exercise_name,
            sets: row.sets,
            reps: row.reps
          })
        })
      })

      setWorkouts(Array.from(workoutMap.values()))
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive"
      })
    }
  }

  const handleTemplateSelect = (template: Template) => {
    console.log('Selected template:', template)
    // TODO: Add logic to schedule the workout
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Workout Planner</h2>
        <Button size="sm" onClick={() => setIsTemplateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Workout
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card className="p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border p-4"
              numberOfMonths={1}
              showOutsideDays={false}
              fixedWeeks
              modifiers={{
                scheduled: scheduledDates
              }}
              modifiersClassNames={{
                scheduled: "bg-success/20 text-success-foreground hover:bg-success/30"
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "grid grid-cols-7 gap-1",
                head_cell: "text-muted-foreground rounded-md font-normal text-[0.8rem] h-9 flex items-center justify-center",
                row: "grid grid-cols-7 gap-1 mt-2",
                cell: "relative h-9 w-9 sm:h-14 sm:w-14 lg:h-16 lg:w-16 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md flex items-center justify-center",
                day: "h-9 w-9 sm:h-14 sm:w-14 lg:h-16 lg:w-16 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors flex items-center justify-center",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "day-outside text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Upcoming Workouts</h3>
            <div className="space-y-4">
              {workouts.length > 0 ? (
                workouts.map((workout) => (
                  <Card key={workout.workout_id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{workout.workout_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(workout.created_at), "PPp")}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-4">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{exercise.exercise_name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No workouts scheduled</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Workouts for {date ? format(date, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <Card key={workout.workout_id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{workout.workout_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(workout.created_at), "p")}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {workoutTypes.find(t => t.id === workout.workout_type)?.label}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{exercise.exercise_name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workouts scheduled for this day</p>
                <Button className="mt-4" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workout
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TemplateSelectorModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        templates={templates}
        folders={folders}
        recentTemplates={recentTemplates}
        onSelect={handleTemplateSelect}
      />
    </div>
  )
}
