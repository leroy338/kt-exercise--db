"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"

interface Template {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
    muscle_group: string
  }[]
  count: number
}

interface TemplateSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Template[]
  onSelect: (template: Template) => void
}

export function TemplateSelectorModal({
  open,
  onOpenChange,
  templates,
  onSelect
}: TemplateSelectorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Workout Template</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {templates.map((template) => (
              <Card 
                key={template.workout_id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  onSelect(template)
                  onOpenChange(false)
                }}
              >
                <div>
                  <h4 className="font-semibold">{template.workout_name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {workoutTypes.find(t => t.id === template.workout_type)?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {template.count} exercises
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from(new Set(template.exercises.map(e => e.muscle_group))).map(group => (
                    <Badge key={group} variant="secondary">
                      {muscleGroups.find(g => g.id === group)?.label}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 