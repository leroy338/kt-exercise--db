"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Share, RotateCcw, Plus, GripHorizontal, Pencil, Trash2, Folder, ChevronRight, ChevronDown, FolderPlus } from "lucide-react"
import { ExerciseSelectorModal } from "@/components/exercise-selector-modal"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { saveWorkout } from "@/app/actions/save-workout"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"
import { TemplateViewerModal } from "@/components/template-viewer-modal"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  muscleGroups: string[]
  type: string
  section?: number
  section_name?: string
}

interface WorkoutItem {
  type: 'exercise' | 'section'
  data: Exercise | null
  title?: string
}

interface SavedWorkout {
  workout_id: number
  workout_name: string
  workout_type: string
  exercises: {
    exercise_name: string
    sets: number
    reps: number
    muscle_group: string
  }[]
  created_at: string
  count: number
}

interface TemplateFolder {
  name?: string;
  workouts?: SavedWorkout[];
  isOpen?: boolean;
  isSpecial?: boolean;
  type?: 'separator';
}

export default function BuilderPage() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [workoutType, setWorkoutType] = useState<string>("")
  const [workoutName, setWorkoutName] = useState("")
  const [isEditingName, setIsEditingName] = useState(true)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null)
  const [templates, setTemplates] = useState<SavedWorkout[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<SavedWorkout | null>(null)
  const [folders, setFolders] = useState<TemplateFolder[]>([
    { name: 'Recent', workouts: [], isOpen: true },
    { name: 'All Templates', workouts: [], isOpen: false },
    { name: 'Favorites', workouts: [], isOpen: false },
  ])
  const supabase = createClient()
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isShareable, setIsShareable] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [newQuickFolderName, setNewQuickFolderName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("")

  const getNextSectionNumber = () => {
    const sections = workoutItems.filter(item => item.type === 'section')
    return sections.length + 1
  }

  const handleExerciseSelect = (exercise: Exercise) => {
    if (!workoutType) setWorkoutType(exercise.type)
    
    if (editingExerciseIndex !== null) {
      // Update existing exercise
      setWorkoutItems(prev => prev.map((item, index) => 
        index === editingExerciseIndex ? { type: 'exercise', data: exercise } : item
      ))
      setEditingExerciseIndex(null)
    } else {
      // Add new exercise
      if (workoutItems.length === 0) {
        setWorkoutItems([
          { type: 'section', data: null, title: `Section ${getNextSectionNumber()}` },
          { type: 'exercise', data: exercise }
        ])
      } else {
        setWorkoutItems(prev => [...prev, { type: 'exercise', data: exercise }])
      }
    }
  }

  const handleAddSection = () => {
    setWorkoutItems(prev => [...prev, { 
      type: 'section', 
      data: null, 
      title: `Section ${getNextSectionNumber()}` 
    }])
  }

  const handleSectionTitleChange = (index: number, title: string) => {
    setWorkoutItems(prev => prev.map((item, i) => 
      i === index ? { ...item, title } : item
    ))
  }

  const handleReset = () => {
    setWorkoutItems([])
    setWorkoutType("")
    setWorkoutName("")
  }

  const workoutTypeLabel = workoutTypes.find(t => t.id === workoutType)?.label

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutName(e.target.value)
  }

  const handleNameBlur = () => {
    if (workoutName.trim()) {
      setIsEditingName(false)
    }
  }

  const handleRowClick = (index: number) => {
    const item = workoutItems[index]
    if (item.type === 'exercise' && item.data) {
      setEditingExerciseIndex(index)
      setIsModalOpen(true)
    }
  }

  const handleRemoveExercise = (index: number) => {
    setWorkoutItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    console.log('Save triggered')
    
    if (!workoutName) {
      toast({
        title: "Error",
        description: "Please enter a workout name",
        variant: "destructive"
      })
      return
    }

    if (!workoutType) {
      toast({
        title: "Error",
        description: "Please select a workout type",
        variant: "destructive"
      })
      return
    }

    const exercises = workoutItems.reduce((acc, item, index) => {
      if (item.type === 'exercise' && item.data) {
        const sectionIndex = workoutItems
          .slice(0, index)
          .filter(i => i.type === 'section')
          .length + 1
        
        acc.push({
          ...item.data,
          section: sectionIndex,
          section_name: workoutItems
            .slice(0, index)
            .filter(i => i.type === 'section')
            .pop()?.title || `Section ${sectionIndex}`
        })
      }
      return acc
    }, [] as Exercise[])

    const result = await saveWorkout(
      exercises,
      workoutName,
      exercises.flatMap(e => e.muscleGroups),
      workoutType,
      selectedFolder
    )

    if (result.success) {
      toast({
        title: "Success",
        description: "Workout saved successfully"
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchFolders()
    fetchTemplates()
  }, [supabase, toast])

  async function fetchTemplates() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to view templates",
          variant: "destructive"
        })
        return
      }

      const { data: workoutsData, error: workoutsError } = await supabase
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
        .order('created_at', { ascending: false })

      if (workoutsError) throw workoutsError

      // Group workouts
      const workoutMap = workoutsData.reduce((acc, exercise) => {
        if (!acc.has(exercise.workout_id)) {
          acc.set(exercise.workout_id, {
            workout_id: exercise.workout_id,
            workout_name: exercise.workout_name,
            workout_type: exercise.workout_type,
            created_at: exercise.created_at,
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
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    
    try {
      console.log('Starting folder creation...')
      console.log('Selected template IDs:', selectedTemplates)
      console.log('New folder name:', newFolderName)
      
      // Call RPC function
      const { data, error } = await supabase
        .rpc('update_workout_folder', { 
          p_workout_id: Number(selectedTemplates[0]),
          p_folder_name: newFolderName 
        })

      if (error) throw error
      
      setFolders([...folders, {
        name: newFolderName,
        workouts: templates.filter(t => selectedTemplates.includes(t.workout_id.toString())),
        isOpen: true
      }])
      
      // Reset form
      setNewFolderName("")
      setIsShareable(false)
      setSelectedTemplates([])
      setIsCreateFolderOpen(false)

      // Refresh templates
      fetchTemplates()
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  async function fetchFolders() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to view folders",
          variant: "destructive"
        })
        return
      }

      // Get all workouts with folders
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('saved_workouts')
        .select(`
          workout_id,
          workout_name,
          workout_type,
          folder,
          exercise_name,
          sets,
          reps,
          muscle_group,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (workoutsError) throw workoutsError

      // Group workouts by folder
      const folderMap = new Map<string, SavedWorkout[]>()
      
      // First, group exercises by workout_id
      const workoutMap = workoutsData.reduce((acc, exercise) => {
        if (!acc.has(exercise.workout_id)) {
          acc.set(exercise.workout_id, {
            workout_id: exercise.workout_id,
            workout_name: exercise.workout_name,
            workout_type: exercise.workout_type,
            folder: exercise.folder,
            created_at: exercise.created_at,
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

      const allWorkouts = Array.from(workoutMap.values())

      // Then, group workouts by folder
      allWorkouts.forEach(workout => {
        if (workout.folder) {
          if (!folderMap.has(workout.folder)) {
            folderMap.set(workout.folder, [])
          }
          folderMap.get(workout.folder)!.push(workout)
        }
      })

      // Update folders state without the Recent folder
      setFolders([
        { 
          name: 'All Templates', 
          workouts: allWorkouts,
          isOpen: false,
          isSpecial: true 
        },
        { type: 'separator' },
        ...Array.from(folderMap.entries()).map(([name, workouts]) => ({
          name,
          workouts,
          isOpen: false,
          isSpecial: false
        }))
      ])

    } catch (error) {
      console.error('Error fetching folders:', error)
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive"
      })
    }
  }

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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-lg font-semibold">Workout Builder</h3>
                  <div className="flex items-center gap-3">
                    {workoutType && (
                      <Badge 
                        variant="secondary" 
                        className="w-[120px] text-center px-4"
                      >
                        {workoutTypes.find(t => t.id === workoutType)?.label}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Workout name"
                        value={workoutName}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        className={cn(
                          "max-w-[200px]",
                          !isEditingName && "border-none p-0 font-semibold"
                        )}
                      />
                      {!isEditingName && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={setSelectedFolder} value={selectedFolder}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders
                        .filter(folder => 
                          // Filter out separators, empty names, and special folders
                          !folder.type && 
                          folder.name && 
                          folder.name.trim() !== '' && 
                          !folder.isSpecial
                        )
                        .map((folder) => (
                          <SelectItem key={folder.name || ''} value={folder.name || ''}>
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4" />
                              {folder.name}
                            </div>
                          </SelectItem>
                        ))}
                      <Separator className="my-2" />
                      <div className="p-2">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderPlus className="h-4 w-4" />
                          <span className="text-sm">Add New Folder</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newQuickFolderName}
                            onChange={(e) => setNewQuickFolderName(e.target.value)}
                            placeholder="Folder name"
                            className="h-8"
                          />
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              if (newQuickFolderName.trim()) {
                                setFolders([...folders, {
                                  name: newQuickFolderName,
                                  workouts: [],
                                  isOpen: true
                                }])
                                setNewQuickFolderName("")
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleSave}>
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
                            <TableCell colSpan={5}>
                              <Input 
                                placeholder="Section title"
                                className="max-w-[200px] font-semibold border-none focus:border-input hover:border-input p-0"
                                value={item.title || ''}
                                onChange={(e) => handleSectionTitleChange(index, e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow 
                            key={`${item.data?.name}-${index}`}
                            className={cn(
                              "cursor-pointer hover:bg-muted/50",
                              editingExerciseIndex === index && "bg-muted/50"
                            )}
                            onClick={() => handleRowClick(index)}
                          >
                            <TableCell>{item.data?.name}</TableCell>
                            <TableCell>{item.data?.sets}</TableCell>
                            <TableCell>{item.data?.reps}</TableCell>
                            <TableCell>{item.data?.rest}s</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRowClick(index)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveExercise(index)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
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
                      <GripHorizontal className="h-4 w-4 mr-2" />
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
                onOpenChange={(open) => {
                  setIsModalOpen(open)
                  if (!open) setEditingExerciseIndex(null)
                }}
                onExerciseSelect={handleExerciseSelect}
                workoutType={workoutType}
                editingExercise={editingExerciseIndex !== null ? workoutItems[editingExerciseIndex].data : undefined}
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Folders</h3>
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Folder Name</Label>
                      <Input
                        id="name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="My Folder"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shareable"
                        checked={isShareable}
                        onCheckedChange={setIsShareable}
                      />
                      <Label htmlFor="shareable">Make folder shareable</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Templates</Label>
                      <ScrollArea className="h-[200px] border rounded-md p-4">
                        {templates.map((template) => (
                          <div key={template.workout_id} className="flex items-center space-x-2 py-2">
                            <Checkbox
                              id={template.workout_id.toString()}
                              checked={selectedTemplates.includes(template.workout_id.toString())}
                              onCheckedChange={(checked) => {
                                setSelectedTemplates(prev => 
                                  checked 
                                    ? [...prev, template.workout_id.toString()]
                                    : prev.filter(id => id !== template.workout_id.toString())
                                )
                              }}
                            />
                            <Label htmlFor={template.workout_id.toString()}>
                              {template.workout_name}
                            </Label>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        console.log('Create button clicked')
                        handleCreateFolder()
                      }}
                      disabled={!newFolderName.trim()}
                    >
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-6">
              {/* Folders Section */}
              <div className="space-y-4">
                {folders
                  .filter(folder => !folder.isSpecial && folder.type !== 'separator')
                  .map((folder, index) => (
                    <Collapsible
                      key={folder.name}
                      open={folder.isOpen}
                      onOpenChange={(isOpen) => {
                        setFolders(folders.map((f, i) => 
                          i === index ? { ...f, isOpen } : f
                        ))
                      }}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-muted/50 p-2 rounded-md">
                        <Folder className="h-4 w-4" />
                        <span className="font-medium">{folder.name}</span>
                        {folder.isOpen ? (
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {folder.workouts?.map((template) => (
                            <Card 
                              key={template.workout_id}
                              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{template.workout_name}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {workoutTypes.find(t => t.id === template.workout_type)?.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {template.count} exercises
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Array.from(new Set(template.exercises.map(e => e.muscle_group))).map(group => (
                                  <Badge key={group} variant="secondary">
                                    {workoutTypes.find(t => t.id === group)?.label}
                                  </Badge>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>

              <Separator className="my-6" />

              {/* Recent Templates Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">Recent Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.slice(0, 3).map((template) => (
                    <Card 
                      key={template.workout_id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{template.workout_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {workoutTypes.find(t => t.id === template.workout_type)?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {template.count} exercises
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(new Set(template.exercises.map(e => e.muscle_group))).map(group => (
                          <Badge key={group} variant="secondary">
                            {workoutTypes.find(t => t.id === group)?.label}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Templates Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">All Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card 
                      key={template.workout_id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{template.workout_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {workoutTypes.find(t => t.id === template.workout_type)?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {template.count} exercises
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(new Set(template.exercises.map(e => e.muscle_group))).map(group => (
                          <Badge key={group} variant="secondary">
                            {workoutTypes.find(t => t.id === group)?.label}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <TemplateViewerModal
            open={!!selectedTemplate}
            onOpenChange={(open) => !open && setSelectedTemplate(null)}
            template={selectedTemplate}
          />
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
