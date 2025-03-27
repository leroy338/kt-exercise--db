"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TemplateSelectorModal, Template } from "@/components/template-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { format, addDays, startOfWeek } from "date-fns"
import { Plus, ChevronRight, Trash2, Share2 } from "lucide-react"
import { workoutTypes } from "@/app/config/workout-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Database } from "@/types/database.types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getUserTimezone, convertToUTC, convertToUserTimezone } from "@/utils/date"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ScheduledWorkout {
  id: string
  scheduled_for: string
  start_time: string | null
  end_time: string | null
  template_id: number
  template: {
    id: number
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
          order: number
        }[]
      }[]
    }
  } | null
}

interface ShareWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout: ScheduledWorkout | null
  onShare: (message: string) => Promise<void>
}

function ShareWorkoutModal({ open, onOpenChange, workout, onShare }: ShareWorkoutModalProps) {
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    try {
      setIsSharing(true)
      await onShare(message)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share workout",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  if (!workout?.template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Workout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Add a message about this workout..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Workout Preview</Label>
            <div className="space-y-4">
              {workout.template.template.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-medium mb-2">{section.name}</h3>
                  <div className="space-y-2">
                    {section.exercises
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((exercise, exerciseIdx) => (
                        <div key={exerciseIdx} className="text-sm">
                          {exercise.order ?? exerciseIdx + 1}. {exercise.name} - {exercise.sets}×{exercise.reps}
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? "Sharing..." : "Share Workout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Planner() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])
  const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [userTimezone, setUserTimezone] = useState<string>("")
  const supabase = createClient()
  const { toast } = useToast()
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)
  const [isAddingWorkout, setIsAddingWorkout] = useState(false)
  const [workoutToShare, setWorkoutToShare] = useState<ScheduledWorkout | null>(null)

  // Calculate dates once at component level
  const today = new Date()
  const currentDay = today.getDay()
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const thisWeeksMonday = addDays(today, daysToMonday)

  // Generate week days once
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    format(addDays(thisWeeksMonday, i), 'yyyy-MM-dd')
  )

  // Log the fixed week days
  console.log('Fixed week days:', weekDays.map(date => ({
    date,
    dayName: format(new Date(date), 'EEEE')
  })))

  useEffect(() => {
    async function initializeTimezone() {
      const timezone = await getUserTimezone()
      setUserTimezone(timezone)
    }
    initializeTimezone()
  }, [])

  const fetchScheduledWorkouts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user's timezone
    const timezone = await getUserTimezone()

    // Calculate week boundaries in user's timezone
    const startDate = new Date(`${weekDays[0]}T00:00:00`)
    const endDate = new Date(`${weekDays[6]}T23:59:59`)
    
    // Convert to UTC for database query
    const utcStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
    const utcEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)

    console.log('Querying date range:', {
      start: utcStartDate.toISOString(),
      end: utcEndDate.toISOString(),
      timezone,
      localStart: startDate.toISOString(),
      localEnd: endDate.toISOString()
    })

    const { data, error } = await supabase
      .from('scheduled_workouts')
      .select(`
        id,
        scheduled_for,
        template:templates (
          id,
          name,
          type,
          template
        )
      `)
      .eq('user_id', user.id)
      .gte('scheduled_for', utcStartDate.toISOString())
      .lte('scheduled_for', utcEndDate.toISOString())
      .not('template', 'is', null)
      .order('scheduled_for')

    if (error) {
      console.error('Error fetching workouts:', error)
      return
    }

    // Convert UTC dates to user's timezone for display
    const workoutsInUserTimezone = data?.map(workout => {
      const utcDate = new Date(workout.scheduled_for)
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)
      
      return {
        ...workout,
        scheduled_for: localDate.toISOString()
      }
    })

    console.log('Processed workouts:', workoutsInUserTimezone?.map(w => ({
      id: w.id,
      scheduled_for: w.scheduled_for,
      formatted_date: format(new Date(w.scheduled_for), 'yyyy-MM-dd')
    })))

    setScheduledWorkouts(workoutsInUserTimezone as unknown as ScheduledWorkout[])
  }

  useEffect(() => {
    async function fetchTemplates() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error:', error)
        return
      }

      setTemplates(data as Template[])
    }

    fetchTemplates()
    fetchScheduledWorkouts()
  }, [supabase])

  const handleAddWorkout = async (template: Template, date: string) => {
    if (isAddingWorkout) return
    
    try {
      setIsAddingWorkout(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Get user's timezone
      const userTimezone = await getUserTimezone()
      
      // Create a date object for the selected day at midnight in the user's timezone
      const localDate = new Date(`${date}T00:00:00`)
      
      // Convert to UTC while preserving the date
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
      
      console.log('Scheduling workout:', {
        selectedDate: date,
        localDate: localDate.toISOString(),
        userTimezone,
        utcDate: utcDate.toISOString(),
        timezoneOffset: localDate.getTimezoneOffset()
      })

      const insertData: Database['public']['Tables']['scheduled_workouts']['Insert'] = {
        user_id: user.id,
        template_id: template.id,
        scheduled_for: utcDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Workout Scheduled",
        description: `Added ${template.name} to ${format(new Date(date), 'EEEE, MMM d')}`
      })

      await fetchScheduledWorkouts()
    } catch (error: any) {
      console.error('Error adding workout:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsAddingWorkout(false)
      setShowTemplateSelector(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error

      toast({
        title: "Workout Removed",
        description: "The workout has been removed from your schedule"
      })

      fetchScheduledWorkouts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
    setWorkoutToDelete(null)
  }

  const handleShareWorkout = async (message: string) => {
    if (!workoutToShare?.template) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Start a transaction
    const { data: publicTemplate, error: publicError } = await supabase
      .from('public_templates')
      .insert({
        template: workoutToShare.template.template,
        name: workoutToShare.template.name,
        type: workoutToShare.template.type,
        user_id: user.id
      })
      .select()
      .single()

    if (publicError) throw publicError

    // Update the original template to mark it as shared
    const { error: updateError } = await supabase
      .from('templates')
      .update({ shared: true })
      .eq('id', workoutToShare.template.id)

    if (updateError) throw updateError

    // Create a thread post
    const { error: threadError } = await supabase
      .from('threads')
      .insert({
        body: message || `Shared a workout: ${workoutToShare.template.name}`,
        user_id: user.id,
        thread_type: 'primary',
        shared_template: {
          workout_name: workoutToShare.template.name,
          workout_type: workoutToShare.template.type,
          sections: workoutToShare.template.template.sections
        }
      })

    if (threadError) throw threadError

    toast({
      title: "Success",
      description: "Workout shared successfully"
    })
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6">
      <h2 className="text-2xl font-semibold mb-8">Weekly Planner</h2>
      
      <div className="space-y-6">
        {weekDays.map((date) => {
          const dayWorkouts = scheduledWorkouts.filter(workout => {
            // Convert both dates to the same format for comparison
            const workoutDate = format(new Date(workout.scheduled_for), 'yyyy-MM-dd')
            const cardDate = date
            
            console.log('Date comparison:', {
              cardDate,
              workoutDate,
              originalScheduledFor: workout.scheduled_for,
              matches: workoutDate === cardDate
            })
            
            return workoutDate === cardDate
          })

          return (
            <Card key={date} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold">
                  <div className="text-xl">{format(new Date(date), 'EEEE')}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowTemplateSelector(true)
                    setSelectedDay(date)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workout
                </Button>
              </div>

              <div className="space-y-3">
                {dayWorkouts.map((workout) => (
                  <Card 
                    key={workout.id} 
                    className="p-4 hover:bg-muted/50 cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => setSelectedTemplate(workout.template ? {
                          ...workout.template,
                          user_id: '',
                          is_public: false,
                          created_at: new Date().toISOString()
                        } as Template : null)}
                      >
                        <div className="font-medium">{workout.template?.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {workout.template?.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {workout.template?.template.sections.reduce(
                              (acc, section) => acc + section.exercises.length, 0
                            )} exercises
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            setWorkoutToShare(workout)
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            setWorkoutToDelete(workout.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {dayWorkouts.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No workouts scheduled
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <TemplateSelectorModal
        open={showTemplateSelector}
        onOpenChange={(open) => {
          if (!open) setShowTemplateSelector(false)
        }}
        templates={templates}
        recentTemplates={templates.slice(0, 3)}
        onSelect={(template) => {
          if (!isAddingWorkout) {  // Only handle if not already adding
            handleAddWorkout(template, selectedDay)
          }
        }}
        onShare={() => {}}
        sharingTemplate={null}
        isSharing={false}
      />

      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplate.template.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-medium mb-2">{section.name}</h3>
                  <div className="space-y-2">
                    {section.exercises
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((exercise, exerciseIdx) => (
                        <div key={exerciseIdx} className="text-sm">
                          {exercise.order ?? exerciseIdx + 1}. {exercise.name} - {exercise.sets}×{exercise.reps}
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!workoutToDelete} onOpenChange={() => setWorkoutToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the workout from your schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workoutToDelete && handleDeleteWorkout(workoutToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareWorkoutModal
        open={!!workoutToShare}
        onOpenChange={(open) => {
          if (!open) setWorkoutToShare(null)
        }}
        workout={workoutToShare}
        onShare={handleShareWorkout}
      />
    </div>
  )
}
