"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TemplateSelectorModal } from "@/components/template-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"

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

interface DayPlan {
  id: number
  name: string
  workouts: Template[]
}

export default function PlanBuilderPage() {
  const [planName, setPlanName] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [days, setDays] = useState<DayPlan[]>(
    Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      name: `Day ${i + 1}`,
      workouts: []
    }))
  )
  const { toast } = useToast()
  const supabase = createClient()

  const workoutTypes = [
    { id: 'strength', label: 'Strength' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'mobility', label: 'Mobility' },
  ]

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: workoutsData, error } = await supabase
          .from('saved_workouts')
          .select(`
            workout_id,
            workout_name,
            workout_type,
            exercise_name,
            sets,
            reps,
            muscle_group,
            created_at
          `)
          .eq('user_id', user.id)

        if (error) throw error

        // Group workouts
        const workoutMap = workoutsData.reduce((acc, exercise) => {
          if (!acc.has(exercise.workout_id)) {
            acc.set(exercise.workout_id, {
              workout_id: exercise.workout_id,
              workout_name: exercise.workout_name,
              workout_type: exercise.workout_type,
              exercises: [],
              count: 0
            })
          }
          
          const workout = acc.get(exercise.workout_id)!
          workout.exercises.push({
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            muscle_group: exercise.muscle_group
          })
          workout.count++
          
          return acc
        }, new Map())

        setTemplates(Array.from(workoutMap.values()))
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
  }

  const handleAddWorkout = (dayId: number) => {
    setSelectedDay(dayId)
    setIsModalOpen(true)
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
  }

  const handleRemoveWorkout = (dayId: number, workoutId: number) => {
    setDays(currentDays => 
      currentDays.map(day => 
        day.id === dayId
          ? { ...day, workouts: day.workouts.filter(w => w.workout_id !== workoutId) }
          : day
      )
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-6">
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
                            <div key={`${day.id}-${workout.workout_id}-${index}`} className="flex items-center gap-2">
                              <span className="font-medium">{workout.workout_name}</span>
                              <Badge variant="outline">
                                {workout.workout_type}
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
                              onClick={() => handleRemoveWorkout(day.id, day.workouts[0].workout_id)}
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
        onSelect={handleTemplateSelect}
      />
    </div>
  )
} 