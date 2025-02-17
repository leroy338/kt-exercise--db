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
import { Calendar, Share2 } from "lucide-react"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface TemplateViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onAction?: (action: 'schedule' | 'plan') => void
  onShare?: (template: Template) => void
  isSharing?: boolean
  planMode?: boolean
  buttonText?: string
}

export function TemplateViewerModal({
  open,
  onOpenChange,
  template,
  onAction,
  onShare,
  isSharing = false,
  planMode = false,
  buttonText = "Schedule"
}: TemplateViewerModalProps) {
  const router = useRouter()
  if (!template) return null

  const handleSchedule = () => {
    router.push(`/protected/workout/schedule/${template.id}`)
    onOpenChange(false)
  }

  const handleAddToPlan = () => {
    router.push(`/protected/plans/add/${template.id}`)
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
          <DialogTitle>{template.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline"
              className={`bg-${workoutTypes.find(t => t.id === template.type)?.color} text-white`}
            >
              {workoutTypes.find(t => t.id === template.type)?.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {template.template.sections.reduce((total, section) => 
                total + section.exercises.length, 0)} exercises
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh]">
          <div className="space-y-4">
            {template.template.sections.map((section, sIndex) => (
              <div key={sIndex} className="space-y-4">
                <h3 className="font-medium">{section.name}</h3>
                {section.exercises.map((exercise, eIndex) => (
                  <div 
                    key={`${sIndex}-${eIndex}`}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="font-medium">{exercise.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                      <span>•</span>
                      <div className="flex gap-1">
                        {exercise.muscleGroups.map(group => {
                          const muscleGroup = muscleGroups.find(m => m.id === group)
                          return (
                            <Badge 
                              key={group}
                              variant="secondary"
                              className={`${muscleGroup?.color} text-white text-xs`}
                            >
                              {muscleGroup?.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
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
          {onShare && (
            <Button
              variant="outline"
              onClick={() => onShare(template)}
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 