import { muscleGroups } from "@/app/config/muscle-groups"
import { Template } from "@/components/template-selector-modal"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { bodyOutlinePath } from "@/app/config/muscle-groups"

interface WeeklyMuscleGroupsProps {
  scheduledWorkouts: {
    template: Template
  }[]
}

export function WeeklyMuscleGroups({ scheduledWorkouts }: WeeklyMuscleGroupsProps) {
  // Collect all muscle groups from scheduled workouts
  const scheduledMuscleGroups = scheduledWorkouts.reduce((groups, workout) => {
    workout.template.template.sections.forEach(section => {
      section.exercises.forEach(exercise => {
        exercise.muscleGroups.forEach(group => {
          if (!groups.includes(group)) {
            groups.push(group)
          }
        })
      })
    })
    return groups
  }, [] as string[])

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Weekly Muscle Focus</h3>
      <div className="relative w-full aspect-[1/2] max-w-[250px] mx-auto">
        <svg viewBox="0 0 100 170" className="w-full">
          {/* Body outline */}
          <path
            d={bodyOutlinePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="opacity-50"
          />
          
          {/* Muscle groups in specific order for proper layering */}
          {['traps', 'back', 'core', 'chest', 'shoulders', 'biceps', 'triceps', 'legs'].map(id => {
            const group = muscleGroups.find(g => g.id === id)
            if (!group) return null
            return (
              <path
                key={group.id}
                d={group.svgPath}
                className={cn(
                  "transition-colors duration-200",
                  scheduledMuscleGroups.includes(group.id)
                    ? group.color
                    : "fill-muted-foreground/10"
                )}
              />
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {muscleGroups.map(group => (
            <div 
              key={group.id}
              className="flex items-center gap-2 text-sm"
            >
              <div className={cn(
                "w-3 h-3 rounded-full",
                scheduledMuscleGroups.includes(group.id)
                  ? group.color
                  : "bg-muted-foreground/20"
              )} />
              <span>{group.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 