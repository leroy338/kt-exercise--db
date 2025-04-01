"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Pencil, Plus, Trash2, Save, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/database.types"
import { ExerciseSelectorModal } from "@/components/exercise-selector-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Template = Database['public']['Tables']['templates']['Row']

interface Section {
  name: string
  type?: string
  exercises: {
    name: string
    sets: number
    reps: number
    rest: number
    muscleGroups: string[]
    duration?: number
  }[]
}

interface EditTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onSave?: () => void
}

function SortableExerciseItem({ 
  exercise, 
  sectionIndex, 
  exerciseIndex, 
  onEdit, 
  onRemove,
  sectionType 
}: { 
  exercise: Section['exercises'][0]
  sectionIndex: number
  exerciseIndex: number
  onEdit: (sectionIndex: number, exerciseIndex: number) => void
  onRemove: (sectionIndex: number, exerciseIndex: number) => void
  sectionType?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${sectionIndex}-${exerciseIndex}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const workoutType = workoutTypes.find(t => t.id === sectionType)
  const isCircuit = workoutType?.builder === 'circuit'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-background p-2 rounded-md border"
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <div className="font-medium">{exercise.name}</div>
        <div className="text-sm text-muted-foreground">
          {isCircuit ? (
            <>
              Work: {exercise.duration || 30}s | Rest: {exercise.rest}s
            </>
          ) : (
            <>
              {exercise.sets} × {exercise.reps} | Rest: {exercise.rest}s
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(sectionIndex, exerciseIndex)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(sectionIndex, exerciseIndex)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function EditTemplateModal({
  open,
  onOpenChange,
  template,
  onSave
}: EditTemplateModalProps) {
  const [editedTemplate, setEditedTemplate] = useState<{
    name: string
    type: string
    sections: Section[]
  } | null>(template?.template as any || null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update editedTemplate when template prop changes
  useEffect(() => {
    if (template?.template) {
      setEditedTemplate(template.template as any)
    }
  }, [template])

  const handleSave = async () => {
    if (!template || !editedTemplate) return

    try {
      const { error } = await supabase
        .from('templates')
        .update({
          name: editedTemplate.name,
          type: editedTemplate.type,
          template: editedTemplate
        })
        .eq('id', template.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Template updated successfully"
      })
      
      onSave?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      })
    }
  }

  const handleExerciseSelect = (exercise: any) => {
    if (!editedTemplate || editingSectionIndex === null) return

    const newSections = [...editedTemplate.sections]
    if (editingExerciseIndex !== null) {
      // Update existing exercise
      newSections[editingSectionIndex].exercises[editingExerciseIndex] = {
        ...exercise,
        muscleGroups: exercise.muscleGroups || [],
        defaultSets: exercise.sets,
        defaultReps: exercise.reps,
        defaultRest: exercise.rest,
        defaultDuration: exercise.duration
      }
    } else {
      // Add new exercise
      newSections[editingSectionIndex].exercises.push({
        ...exercise,
        muscleGroups: exercise.muscleGroups || [],
        defaultSets: exercise.sets,
        defaultReps: exercise.reps,
        defaultRest: exercise.rest,
        defaultDuration: exercise.duration
      })
    }

    setEditedTemplate({
      ...editedTemplate,
      sections: newSections
    })
    setIsExerciseModalOpen(false)
    setEditingSectionIndex(null)
    setEditingExerciseIndex(null)
  }

  const addSection = () => {
    if (!editedTemplate || !template) return
    setEditedTemplate({
      ...editedTemplate,
      sections: [
        ...editedTemplate.sections,
        {
          name: `Section ${editedTemplate.sections.length + 1}`,
          type: template.type,
          exercises: []
        }
      ]
    })
  }

  const addExercise = (sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex)
    setEditingExerciseIndex(null)
    setIsExerciseModalOpen(true)
  }

  const editExercise = (sectionIndex: number, exerciseIndex: number) => {
    setEditingSectionIndex(sectionIndex)
    setEditingExerciseIndex(exerciseIndex)
    setIsExerciseModalOpen(true)
  }

  const updateExercise = (sectionIndex: number, exerciseIndex: number, field: string, value: any) => {
    if (!editedTemplate) return
    const newSections = [...editedTemplate.sections]
    newSections[sectionIndex].exercises[exerciseIndex] = {
      ...newSections[sectionIndex].exercises[exerciseIndex],
      [field]: value
    }
    setEditedTemplate({
      ...editedTemplate,
      sections: newSections
    })
  }

  const removeExercise = (sectionIndex: number, exerciseIndex: number) => {
    if (!editedTemplate) return
    const newSections = [...editedTemplate.sections]
    newSections[sectionIndex].exercises.splice(exerciseIndex, 1)
    setEditedTemplate({
      ...editedTemplate,
      sections: newSections
    })
  }

  const removeSection = (sectionIndex: number) => {
    if (!editedTemplate) return
    const newSections = [...editedTemplate.sections]
    newSections.splice(sectionIndex, 1)
    setEditedTemplate({
      ...editedTemplate,
      sections: newSections
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!editedTemplate) return

    const { active, over } = event
    if (!over) return

    const [sectionIndex, exerciseIndex] = (active.id as string).split('-').map(Number)
    const [overSectionIndex, overExerciseIndex] = (over.id as string).split('-').map(Number)

    if (sectionIndex === overSectionIndex) {
      // Reorder within the same section
      const newSections = [...editedTemplate.sections]
      const exercises = [...newSections[sectionIndex].exercises]
      const [movedExercise] = exercises.splice(exerciseIndex, 1)
      exercises.splice(overExerciseIndex, 0, movedExercise)
      newSections[sectionIndex].exercises = exercises
      setEditedTemplate({
        ...editedTemplate,
        sections: newSections
      })
    }
  }

  if (!template || !editedTemplate) return null

  const workoutType = workoutTypes.find(t => t.id === template.type)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate({
                    ...editedTemplate,
                    name: e.target.value
                  })}
                  className="text-xl font-semibold"
                />
                <Badge variant="outline">
                  {workoutType?.label}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {editedTemplate.sections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Input
                      value={section.name}
                      onChange={(e) => {
                        const newSections = [...editedTemplate.sections]
                        newSections[sectionIndex].name = e.target.value
                        setEditedTemplate({
                          ...editedTemplate,
                          sections: newSections
                        })
                      }}
                      className="font-semibold w-auto"
                    />
                    <Select
                      value={section.type || template.type}
                      onValueChange={(value) => {
                        const newSections = [...editedTemplate.sections]
                        newSections[sectionIndex].type = value
                        setEditedTemplate({
                          ...editedTemplate,
                          sections: newSections
                        })
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workoutTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={section.exercises.map((_, index) => `${sectionIndex}-${index}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {section.exercises.map((exercise, exerciseIndex) => (
                        <SortableExerciseItem
                          key={`${sectionIndex}-${exerciseIndex}`}
                          exercise={exercise}
                          sectionIndex={sectionIndex}
                          exerciseIndex={exerciseIndex}
                          onEdit={editExercise}
                          onRemove={removeExercise}
                          sectionType={section.type}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <Button
                    variant="outline"
                    onClick={() => addExercise(sectionIndex)}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={addSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExerciseSelectorModal
        open={isExerciseModalOpen}
        onOpenChange={setIsExerciseModalOpen}
        onExerciseSelect={handleExerciseSelect}
        workoutType={template.type}
        editingExercise={editingExerciseIndex !== null && editingSectionIndex !== null 
          ? {
              ...editedTemplate.sections[editingSectionIndex].exercises[editingExerciseIndex],
              type: template.type,
              defaultSets: editedTemplate.sections[editingSectionIndex].exercises[editingExerciseIndex].sets,
              defaultReps: editedTemplate.sections[editingSectionIndex].exercises[editingExerciseIndex].reps,
              defaultRest: editedTemplate.sections[editingSectionIndex].exercises[editingExerciseIndex].rest,
              defaultDuration: editedTemplate.sections[editingSectionIndex].exercises[editingExerciseIndex].duration
            }
          : undefined}
      />
    </>
  )
} 