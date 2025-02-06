"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Share, RotateCcw, Plus } from "lucide-react"
import { ExerciseSelectorModal } from "@/components/exercise-selector-modal"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  type: string
}

interface WorkoutItem {
  type: 'exercise' | 'section'
  data: Exercise | null
}

export default function BuilderPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [workoutType, setWorkoutType] = useState<string>("")
  const [workoutName, setWorkoutName] = useState("")

  const handleExerciseSelect = (exercise: Exercise) => {
    if (!workoutType) setWorkoutType(exercise.type)
    setWorkoutItems(prev => [...prev, { type: 'exercise', data: exercise }])
  }

  const handleAddSection = () => {
    setWorkoutItems(prev => [...prev, { type: 'section', data: null }])
  }

  const handleReset = () => {
    setWorkoutItems([])
    setWorkoutType("")
    setWorkoutName("")
  }

  const workoutTypeLabel = workoutTypes.find(t => t.id === workoutType)?.label

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      <h2 className="text-2xl font-semibold">Builder</h2>
      <p>
        The builder is a tool that allows you to create your own workouts.
        You can add exercises to your workout, and then save it as a template.
        You can then use the template to create a new workout.
      </p>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Workout Builder</h3>
                    {workoutType && (
                      <Badge variant="secondary">
                        {workoutTypeLabel}
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="Workout name"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {workoutItems.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead>Sets</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Rest</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workoutItems.map((item, index) => (
                        item.type === 'section' ? (
                          <TableRow key={`section-${index}`}>
                            <TableCell colSpan={4} className="bg-muted/50">
                              <div className="h-0.5" />
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={`${item.data?.name}-${index}`}>
                            <TableCell>{item.data?.name}</TableCell>
                            <TableCell>{item.data?.sets}</TableCell>
                            <TableCell>{item.data?.reps}</TableCell>
                            <TableCell>{item.data?.rest}s</TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleAddSection}
                    >
                      <Separator className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              )}

              <ExerciseSelectorModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onExerciseSelect={handleExerciseSelect}
                workoutType={workoutType}
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Templates</h3>
            {/* Templates content will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Training Plans</h3>
            {/* Plans content will go here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
