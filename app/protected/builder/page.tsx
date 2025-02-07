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
import { TemplateSelectorModal, Template } from "@/components/template-selector-modal"
import { PlanBuilder } from "@/components/plan-builder"

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
  const [folders, setFolders] = useState<{name: string, templates: Template[]}[]>([])
  const supabase = createClient()
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
  const [foldersState, setFoldersState] = useState<TemplateFolder[]>([
    { name: 'Recent', workouts: [], isOpen: true },
    { name: 'All Templates', workouts: [], isOpen: false },
    { name: 'Favorites', workouts: [], isOpen: false },
  ])
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isShareable, setIsShareable] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [newQuickFolderName, setNewQuickFolderName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [openFolders, setOpenFolders] = useState<string[]>([])
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([])
  const [view, setView] = useState<'folders' | 'all'>('folders')
  const [allTemplates, setAllTemplates] = useState<Template[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

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
    fetchRecentTemplates()
    fetchAllTemplates()
  }, [])

  async function fetchFolders() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // First get folders
      const { data: folderData, error: folderError } = await supabase
        .from('saved_workouts')
        .select('folder')
        .not('folder', 'is', null)
        .order('folder')

      if (folderError) throw folderError

      // Get unique folders
      const uniqueFolders = Array.from(new Set(folderData.map(row => row.folder)))
        .map(folderName => ({ name: folderName, templates: [] }))

      // Then get all workouts for these folders
      const { data: workouts, error: workoutsError } = await supabase
        .from('saved_workouts')
        .select(`
          workout_id,
          workout_name,
          workout_type,
          exercise_name,
          sets,
          reps,
          muscle_group,
          created_at,
          folder
        `)
        .in('folder', uniqueFolders.map(f => f.name))

      if (workoutsError) throw workoutsError

      // Group workouts by folder
      const folderMap = new Map<string, Template[]>(uniqueFolders.map(f => [f.name, []]))
      
      // First group by workout_id
      const workoutMap = new Map()
      workouts.forEach(row => {
        if (!workoutMap.has(row.workout_id)) {
          workoutMap.set(row.workout_id, {
            workout_id: row.workout_id,
            workout_name: row.workout_name,
            workout_type: row.workout_type,
            created_at: row.created_at,
            exercises: [],
            count: 0
          })
        }
        const workout = workoutMap.get(row.workout_id)
        workout.exercises.push({
          exercise_name: row.exercise_name,
          sets: row.sets,
          reps: row.reps,
          muscle_group: row.muscle_group
        })
        workout.count = workout.exercises.length
      })

      // Then organize into folders
      workouts.forEach(row => {
        const workout = workoutMap.get(row.workout_id)
        const folderTemplates = folderMap.get(row.folder)
        if (workout && folderTemplates && !folderTemplates.some((w: { workout_id: number }) => w.workout_id === workout.workout_id)) {
          folderTemplates.push(workout)
        }
      })

      // Update state with organized folders
      setFolders(Array.from(folderMap.entries()).map(([name, templates]) => ({
        name,
        templates
      })))

    } catch (error) {
      console.error('Error fetching folders:', error)
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive"
      })
    }
  }

  const handleFolderSelect = async (folderName: string) => {
    setSelectedFolder(folderName)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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
        .eq('folder', folderName)

      if (error) throw error

      // Group by workout_id
      const templateMap = new Map<number, Template>()
      data.forEach(row => {
        if (!templateMap.has(row.workout_id)) {
          templateMap.set(row.workout_id, {
            workout_id: row.workout_id,
            workout_name: row.workout_name,
            workout_type: row.workout_type,
            created_at: row.created_at,
            exercises: [],
            count: 0
          })
        }
        const template = templateMap.get(row.workout_id)!
        template.exercises.push({
          exercise_name: row.exercise_name,
          sets: row.sets,
          reps: row.reps,
          muscle_group: row.muscle_group
        })
        template.count = template.exercises.length
      })

      setTemplates(Array.from(templateMap.values()))
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    }
  }

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
      
      setFoldersState(prev => prev.map((folder) => ({
        ...folder,
        workouts: folder.name === 'All Templates' ? data.map((row: string) => ({
          name: row,
          isOpen: true
        })) : undefined
      })))
      
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

  const toggleFolder = (folderName: string) => {
    setOpenFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(name => name !== folderName)
        : [...prev, folderName]
    )
  }

  async function fetchRecentTemplates() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by workout_id
      const workoutMap = new Map<number, Template>()
      data.forEach(row => {
        if (!workoutMap.has(row.workout_id)) {
          workoutMap.set(row.workout_id, {
            workout_id: row.workout_id,
            workout_name: row.workout_name,
            workout_type: row.workout_type,
            created_at: row.created_at,
            exercises: [],
            count: 0
          })
        }
        const workout = workoutMap.get(row.workout_id)!
        workout.exercises.push({
          exercise_name: row.exercise_name,
          sets: row.sets,
          reps: row.reps,
          muscle_group: row.muscle_group
        })
        workout.count = workout.exercises.length
      })

      // Get only the 3 most recent templates
      setRecentTemplates(Array.from(workoutMap.values()).slice(0, 3))
    } catch (error) {
      console.error('Error fetching recent templates:', error)
      toast({
        title: "Error",
        description: "Failed to load recent templates",
        variant: "destructive"
      })
    }
  }

  async function fetchAllTemplates() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by workout_id
      const workoutMap = new Map<number, Template>()
      data.forEach(row => {
        if (!workoutMap.has(row.workout_id)) {
          workoutMap.set(row.workout_id, {
            workout_id: row.workout_id,
            workout_name: row.workout_name,
            workout_type: row.workout_type,
            created_at: row.created_at,
            exercises: [],
            count: 0
          })
        }
        const workout = workoutMap.get(row.workout_id)!
        workout.exercises.push({
          exercise_name: row.exercise_name,
          sets: row.sets,
          reps: row.reps,
          muscle_group: row.muscle_group
        })
        workout.count = workout.exercises.length
      })

      setAllTemplates(Array.from(workoutMap.values()))
    } catch (error) {
      console.error('Error fetching all templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    }
  }

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template)
    setIsTemplateModalOpen(true)
  }

  const handleTemplateAction = async (action: 'plan' | 'schedule') => {
    if (!selectedTemplate) return

    if (action === 'plan') {
      // TODO: Add to plan logic
      toast({
        title: "Coming Soon",
        description: "Adding to plan will be available soon",
      })
    } else {
      // TODO: Schedule workout logic
      toast({
        title: "Coming Soon",
        description: "Scheduling workouts will be available soon",
      })
    }

    setIsTemplateModalOpen(false)
  }

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card 
      key={template.workout_id}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => handleTemplateClick(template)}
    >
      <h4 className="font-medium">{template.workout_name}</h4>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline">
          {workoutTypes.find(t => t.id === template.workout_type)?.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {template.count} exercises
        </span>
      </div>
    </Card>
  )

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
                  <Select onValueChange={handleFolderSelect} value={selectedFolder}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders?.map((folder) => (
                        <SelectItem key={folder.name} value={folder.name}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {folder.name}
                            <span className="text-muted-foreground ml-auto">
                              ({folder.templates.length})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentTemplates.map((template: Template) => (
                    <TemplateCard key={template.workout_id} template={template} />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {view === 'folders' ? 'Folders' : 'All Templates'}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setView(view === 'folders' ? 'all' : 'folders')}
                >
                  {view === 'folders' ? 'View All' : 'View Folders'}
                </Button>
              </div>

              {view === 'folders' ? (
                <div className="space-y-2">
                  {folders.map((folder) => (
                    <Collapsible
                      key={folder.name}
                      open={openFolders.includes(folder.name)}
                      onOpenChange={() => toggleFolder(folder.name)}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-muted/50 p-2 rounded-md">
                        {openFolders.includes(folder.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <h3 className="font-medium">{folder.name}</h3>
                        <span className="text-muted-foreground ml-2">
                          ({folder.templates.length})
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-3 gap-4 mt-2 p-2">
                          {folder.templates.map((template: Template) => (
                            <TemplateCard key={template.workout_id} template={template} />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allTemplates.map((template: Template) => (
                    <TemplateCard key={template.workout_id} template={template} />
                  ))}
                </div>
              )}
            </div>
          </Card>

          <TemplateViewerModal
            open={!!selectedTemplate}
            onOpenChange={(open) => !open && setSelectedTemplate(null)}
            template={selectedTemplate}
          />

          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedTemplate?.workout_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTemplate?.exercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{exercise.exercise_name}</span>
                    <span className="text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTemplateAction('plan')}
                  >
                    Add to Plan
                  </Button>
                  <Button
                    onClick={() => handleTemplateAction('schedule')}
                  >
                    Schedule Workout
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="plans">
          <div className="space-y-6">
            <PlanBuilder />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
