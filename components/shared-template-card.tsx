import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Save, Share2 } from "lucide-react"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"

interface SharedTemplateProps {
  body: {
    workout_name: string
    workout_type: string
    sections: {
      name: string
      exercises: {
        name: string
        sets: number
        reps: number
        muscle_group: string
        rest: number
      }[]
    }[]
  }
  onSave?: () => void
}

export function SharedTemplateCard({ body, onSave }: SharedTemplateProps) {
  const workout = JSON.parse(typeof body === 'string' ? body : JSON.stringify(body))

  return (
    <Card className="p-3 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base">{workout.workout_name}</h3>
          <Badge variant="outline" className="mt-1 text-xs">
            {workoutTypes.find(t => t.id === workout.workout_type)?.label}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onSave} className="h-8">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>

      <div className="space-y-2">
        {workout.sections.map((section: any, idx: number) => (
          <div key={idx} className="space-y-1">
            <h4 className="font-medium text-xs text-muted-foreground">
              {section.name}
            </h4>
            <div className="space-y-1">
              {section.exercises.map((exercise: any, exerciseIdx: number) => (
                <div 
                  key={exerciseIdx}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{exercise.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{exercise.sets} × {exercise.reps}</span>
                      <span>•</span>
                      <span>{exercise.rest}s</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {muscleGroups.find(g => g.id === exercise.muscle_group)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 