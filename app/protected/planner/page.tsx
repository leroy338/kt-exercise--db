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
import { Plus, PlayCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { TemplateSelectorModal } from "@/components/template-selector-modal"
import { TemplateViewerModal } from "@/components/template-viewer-modal"
import { useRouter } from "next/navigation"

interface Template {
  id: number
  user_id: string
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
        muscleGroups: string[]
      }[]
    }[]
  }
  folder?: string
  is_public: boolean
  created_at: string
}

interface ScheduledWorkout {
  id: string
  user_id: string
  template_id: number
  scheduled_for: string
}

export default function Planner() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTab, setSelectedTab] = useState("schedule")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])
  const [scheduledDates, setScheduledDates] = useState<Date[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [folders, setFolders] = useState<{name: string, templates: Template[]}[]>([])
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([])
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [sharingTemplate, setSharingTemplate] = useState<Template | null>(null)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchScheduledWorkouts()
    fetchTemplates()
  }, [])

  const fetchScheduledWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive"
        })
        return
      }

      // Get today's date at start of day
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get date 7 days from now at end of day
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('id, user_id, template_id, scheduled_for')
        .eq('user_id', user.id)
        .gte('scheduled_for', today.toISOString())
        .lte('scheduled_for', nextWeek.toISOString())
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      setScheduledWorkouts(data)
      setScheduledDates(data.map(item => new Date(item.scheduled_for)))
    } catch (error: any) {
      console.error('Error in fetchScheduledWorkouts:', error.message || 'Unknown error')
      toast({
        title: "Error",
        description: error.message || "Failed to load scheduled workouts",
        variant: "destructive"
      })
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      // Group by folders
      const folderMap = new Map<string, Template[]>()
      data.forEach(template => {
        if (template.folder) {
          if (!folderMap.has(template.folder)) {
            folderMap.set(template.folder, [])
          }
          folderMap.get(template.folder)!.push(template)
        }
      })

      setFolders(Array.from(folderMap.entries()).map(([name, templates]) => ({
        name,
        templates
      })))

      // Set recent templates
      setRecentTemplates(
        data
          .filter(t => !t.folder)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
      )

      setTemplates(data)
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

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          workout_id,
          scheduled_for,
          template:templates!inner (
            id,
            user_id,
            name,
            type,
            template,
            folder,
            is_public,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .gte('scheduled_for', startOfDay.toISOString())
        .lte('scheduled_for', endOfDay.toISOString())

      if (error) throw error
      setScheduledWorkouts(data as unknown as ScheduledWorkout[])
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive"
      })
    }
  }

  const handleTemplateSelect = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !date) return

      const today = new Date()
      const selectedDate = new Date(date)
      
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const selectedStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      
      const isToday = todayStart.getTime() === selectedStart.getTime()
      
      const scheduledFor = isToday 
        ? today.toISOString()
        : new Date(selectedDate.setHours(9, 0, 0, 0)).toISOString()

      const { error } = await supabase
        .from('scheduled_workouts')
        .insert({
          user_id: user.id,
          workout_id: template.id,
          scheduled_for: scheduledFor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: isToday 
          ? "Workout added for today" 
          : "Workout scheduled successfully"
      })
      
      fetchScheduledWorkouts()
      setIsTemplateModalOpen(false)
    } catch (error) {
      console.error('Error scheduling workout:', error)
      toast({
        title: "Error",
        description: "Failed to schedule workout",
        variant: "destructive"
      })
    }
  }

  const handleTemplateAction = async (action: 'schedule' | 'plan') => {
    if (!viewingTemplate) return
    await handleTemplateSelect(viewingTemplate)
  }

  const handleStartWorkout = (templateId: number) => {
    router.push(`/protected/workout/start/${templateId}`)
  }

  const isToday = (dateStr: string) => {
    const today = new Date()
    const compareDate = new Date(dateStr)
    return today.toDateString() === compareDate.toDateString()
  }

  const handleShare = async (template: Template) => {
    // Copy the same share logic from BuilderPage
  }

  const fetchTemplateDetails = async (templateId: number) => {
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, type')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return data
  }

  const removeScheduledWorkout = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      console.log('Starting delete for workout:', workoutId, 'user:', user.id)
      
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .match({ 
          id: workoutId,
          user_id: user.id
        })
        .select()

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log('Delete successful:', data)
      
      // Refetch to ensure we have the latest data
      console.log('Refetching workouts...')
      await fetchScheduledWorkouts()
      console.log('Refetch complete')

    } catch (error: any) {
      console.error('Error removing workout:', error.message || 'Unknown error')
      toast({
        title: "Error",
        description: "Failed to remove workout: " + (error.message || "Unknown error"),
        variant: "destructive"
      })
    }
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

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Upcoming Workouts</h3>
            <div className="space-y-4">
              {scheduledWorkouts.length > 0 ? (
                scheduledWorkouts.map((workout) => (
                  <Card key={workout.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(workout.scheduled_for), "PPp")}
                      </p>
                      <div className="flex gap-2">
                        {isToday(workout.scheduled_for) && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWorkout(workout.template_id)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('Remove clicked for workout:', workout.id)
                            removeScheduledWorkout(workout.id)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No workouts scheduled</p>
              )}
            </div>
          </Card>
        </TabsContent>
        
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
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Workouts for {date ? format(date, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {scheduledWorkouts.length > 0 ? (
              scheduledWorkouts.map((workout) => (
                <Card key={workout.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.scheduled_for), "PPp")}
                    </p>
                    <div className="flex gap-2">
                      {isToday(workout.scheduled_for) && (
                        <Button
                          size="sm"
                          onClick={() => handleStartWorkout(workout.template_id)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('Remove clicked for workout:', workout.id)
                          removeScheduledWorkout(workout.id)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workouts scheduled for this day</p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsTemplateModalOpen(true)}
                >
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
        onShare={handleShare}
        sharingTemplate={sharingTemplate}
        isSharing={isSharing}
        actionText={date && new Date(date).toDateString() === new Date().toDateString() 
          ? "Add Today" 
          : "Schedule"}
      />

      <TemplateViewerModal
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        template={viewingTemplate}
        onAction={handleTemplateAction}
        planMode={true}
        buttonText={date && new Date(date).toDateString() === new Date().toDateString() 
          ? "Add Today" 
          : "Schedule"}
      />
    </div>
  )
}
