"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Template } from "@/components/template-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { toast } from "@/components/ui/use-toast"

export default function FolderView() {
  const params = useParams()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const folderName = params.folder as string
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('user_id', user.id)
          .eq('folder', folderName)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTemplates(data)
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [supabase, folderName])

  const handleCardClick = (templateId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setExpandedTemplateId(expandedTemplateId === templateId ? null : templateId)
  }

  const handleStartWorkout = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to start a workout",
          variant: "destructive"
        })
        return
      }

      router.push(`/protected/workout/start/${template.id}`)
    } catch (error) {
      console.error('Error starting workout:', error)
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive"
      })
    }
  }

  const handleScheduleWorkout = (templateId: number) => {
    router.push(`/protected/workout/schedule/${templateId}`)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">{folderName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={(e) => handleCardClick(template.id, e)}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={`bg-${workoutTypes.find(t => t.id === template.type)?.color} text-white`}
                  >
                    {workoutTypes.find(t => t.id === template.type)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {template.template.sections.reduce((acc, section) => 
                      acc + section.exercises.length, 0)} exercises • {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => { 
                    e.stopPropagation()
                    handleStartWorkout(template)
                  }}
                  title="Start Workout"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => { 
                    e.stopPropagation()
                    handleScheduleWorkout(template.id)
                  }}
                  title="Schedule Workout"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {Array.from(new Set(
                template.template.sections.flatMap(section => 
                  section.exercises.flatMap(exercise => exercise.muscleGroups)
                )
              )).map(group => {
                const muscleGroup = muscleGroups.find(g => g.id === group)
                return (
                  <Badge 
                    key={`${template.id}-${group}`} 
                    variant="secondary"
                    className={`${muscleGroup?.color} text-white`}
                  >
                    {muscleGroup?.label}
                  </Badge>
                )
              })}
            </div>

            {expandedTemplateId === template.id && (
              <div className="mt-4 space-y-2 border-t pt-4">
                {template.template.sections.map((section, sectionIndex) => (
                  <div key={`${template.id}-section-${sectionIndex}`}>
                    <h4 className="font-medium mb-2">{section.name}</h4>
                    {section.exercises.map((exercise, exerciseIndex) => (
                      <div 
                        key={`${template.id}-section-${sectionIndex}-exercise-${exerciseIndex}`}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 