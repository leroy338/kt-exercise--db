"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ListPlus } from "lucide-react"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

interface Exercise {
  exercise_name: string
  sets: number
  reps: number
  muscle_group: string
}

interface Template {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: Exercise[]
  count: number
}

interface TemplateViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onAction?: (action: 'schedule' | 'plan') => void
  planMode?: boolean
  buttonText?: string
}

export function TemplateViewerModal({
  open,
  onOpenChange,
  template,
  onAction,
  planMode = false,
  buttonText = "Schedule"
}: TemplateViewerModalProps) {
  const router = useRouter()
  if (!template) return null

  const handleSchedule = () => {
    router.push(`/protected/workout/schedule/${template.workout_id}`)
    onOpenChange(false)
  }

  const handleAddToPlan = () => {
    router.push(`/protected/plans/add/${template.workout_id}`)
    onOpenChange(false)
  }

  const handleAction = (action: 'schedule' | 'plan') => {
    if (onAction) {
      onAction(action)
    } else if (action === 'schedule') {
      handleSchedule()
    } else if (action === 'plan') {
      handleAddToPlan()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template.workout_name}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              {workoutTypes.find(t => t.id === template.workout_type)?.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {template.count} exercises
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh]">
          <div className="space-y-4">
            {template.exercises.map((exercise, index) => (
              <div 
                key={`${exercise.exercise_name}-${index}`}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="font-medium">{exercise.exercise_name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{exercise.sets} sets × {exercise.reps} reps</span>
                  <span>•</span>
                  <Badge variant="secondary">
                    {muscleGroups.find(g => g.id === exercise.muscle_group)?.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-start gap-2">
          <Button 
            onClick={() => handleAction('schedule')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 