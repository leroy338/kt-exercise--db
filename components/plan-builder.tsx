"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, Pencil } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TemplateSelectorModal, Template } from "@/components/template-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { TemplateViewerModal } from "@/components/template-viewer-modal"

interface DayPlan {
  id: number
  name: string
  workouts: Template[]
}

export function PlanBuilder() {
  const [planName, setPlanName] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isTemplateViewerOpen, setIsTemplateViewerOpen] = useState(false)
  const [days, setDays] = useState<DayPlan[]>(
    Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      name: `Day ${i + 1}`,
      workouts: []
    }))
  )
  const { toast } = useToast()
  const supabase = createClient()
  const [folders, setFolders] = useState<{name: string, templates: Template[]}[]>([])
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [sharingTemplate, setSharingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
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
      }
    }

    fetchTemplates()
  }, [supabase])

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan name",
        variant: "destructive"
      })
      return
    }

    // TODO: Implement save functionality
    toast({
      title: "Coming Soon",
      description: "Save functionality will be available soon"
    })
  }

  const handleTemplateSelect = (template: Template) => {
    if (selectedDay === null) return
    
    setDays(currentDays => 
      currentDays.map(day => 
        day.id === selectedDay
          ? { ...day, workouts: [template] }
          : day
      )
    )
    
    setIsModalOpen(false)
    toast({
      title: "Template Added",
      description: `Added ${template.name} to Day ${selectedDay}`
    })
  }

  const handleTemplateAction = (action: 'schedule' | 'plan') => {
    if (!selectedTemplate || selectedDay === null) return

    if (action === 'plan') {
      setDays(currentDays => 
        currentDays.map(day => 
          day.id === selectedDay
            ? { ...day, workouts: [selectedTemplate] }
            : day
        )
      )
    }
    
    setIsTemplateViewerOpen(false)
  }

  const handleAddWorkout = (dayId: number) => {
    setSelectedDay(dayId)
    setIsModalOpen(true)
  }

  const handleRemoveWorkout = (dayId: number, workoutId: number) => {
    setDays(currentDays => 
      currentDays.map(day => 
        day.id === dayId
          ? { ...day, workouts: day.workouts.filter(w => w.id !== workoutId) }
          : day
      )
    )
  }

  const handleShare = async (template: Template) => {
    // Copy the same share logic from BuilderPage
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-lg font-semibold">Plan Builder</h3>
              <Input
                placeholder="Plan name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            </div>
          </div>

          {/* Plan Content */}
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Day</TableHead>
                  <TableHead>Workouts</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day) => (
                  <TableRow key={day.id}>
                    <TableCell className="font-medium">{day.name}</TableCell>
                    <TableCell>
                      {day.workouts.length === 0 ? (
                        <span className="text-muted-foreground">No workouts added</span>
                      ) : (
                        <div className="space-y-1">
                          {day.workouts.map((workout, index) => (
                            <div key={`${day.id}-${workout.id}-${index}`} className="flex items-center gap-2">
                              <span className="font-medium">{workout.name}</span>
                              <Badge variant="outline">
                                {workoutTypes.find(t => t.id === workout.type)?.label}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {day.workouts.length === 0 ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddWorkout(day.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAddWorkout(day.id)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveWorkout(day.id, day.workouts[0].id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <TemplateSelectorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        templates={templates}
        folders={folders}
        recentTemplates={recentTemplates}
        onSelect={handleTemplateSelect}
        onShare={handleShare}
        sharingTemplate={sharingTemplate}
        isSharing={isSharing}
      />

    </>
  )
} 