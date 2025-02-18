"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TemplateSelectorModal } from "@/components/template-selector-modal"
import { useState, useEffect } from "react"
import { Template } from "@/components/template-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ScheduledWorkout {
  id: string
  scheduled_for: string
  template: {
    id: number
    name: string
    type: string
  }[]
}

export default function Planner() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchScheduledWorkouts() {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          scheduled_for,
          template:templates (
            id,
            name,
            type
          )
        `)
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('Error:', error)
        return
      }

      console.log('Raw data:', JSON.stringify(data, null, 2))
      setScheduledWorkouts(data)
    }

    fetchScheduledWorkouts()
  }, [supabase])

  const handleTemplateSelect = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const insertData = {
        user_id: user.id,
        template_id: template.id,
        scheduled_for: new Date().toISOString()
      }

      console.log('User:', user.id)
      console.log('Template:', template)
      console.log('Insert Data:', insertData)

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .insert(insertData)

      if (error) {
        console.error('Supabase Error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Success Data:', data)

      toast({
        title: "Workout Scheduled",
        description: `Added ${template.name} to your schedule`
      })
      
      setShowTemplateSelector(false)
    } catch (error: any) {
      // Log the raw error first
      console.error('Raw error:', error)
      
      // Then log structured error if available
      console.error('Structured error:', {
        name: error.name,
        message: error.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error.stack
      })

      toast({
        title: "Error",
        description: error.message || "Failed to schedule workout",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Workout Planner</h2>
        <Button onClick={() => setShowTemplateSelector(true)}>
          Add Workout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scheduledWorkouts.map((workout) => (
          <Card key={workout.id} className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(workout.scheduled_for), 'EEEE, MMMM d')}
              </div>
              <h3 className="font-semibold">
                {workout.template?.[0]?.name || `Template ${workout.template?.[0]?.id}`}
              </h3>
              <div className="text-sm text-muted-foreground">
                {workout.template?.[0]?.type || 'Unknown type'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <TemplateSelectorModal
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        templates={templates}
        recentTemplates={[]}
        onSelect={handleTemplateSelect}
        onShare={() => {}}
        sharingTemplate={null}
        isSharing={false}
      />
    </div>
  )
}
