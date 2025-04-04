"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Share, RotateCcw, Plus, GripHorizontal, Pencil, Trash2, Folder, ChevronRight, ChevronDown, FolderPlus, Share2 } from "lucide-react"
import { ExerciseSelectorModal } from "@/components/exercise-selector-modal"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
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
import { saveTemplate } from "@/app/actions/save-template"
import { Exercise as BaseExercise, exercises } from "@/app/config/exercises"

type WorkoutExercise = BaseExercise & {
  sets: number | null
  reps: number | null
  rest: number | null
  duration?: number | null
  section?: number
  section_name?: string
  order?: number
}

interface WorkoutItem {
  type: 'exercise' | 'section'
  data: WorkoutExercise | null
  title?: string
  sectionType?: string
}

interface SavedWorkout {
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
  is_public: boolean
  created_at: string
}

interface TemplateFolder {
  name?: string;
  workouts?: SavedWorkout[];
  isOpen?: boolean;
  isSpecial?: boolean;
  type?: 'separator';
}

interface WorkoutTemplate {
  id: number
  user_id: string
  name: string
  type: string
  folder?: string
  template: {
    sections: {
      name: string
      exercises: {
        name: string
        sets: number
        reps: number
        rest: number
        muscleGroups: string[]
        order: number
      }[]
    }[]
  }
  is_public: boolean
  created_at: string
}

interface TemplateData {
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
  is_public: boolean
  folder?: string
  user_id: string
}

interface TemplateStructure {
  sections: {
    name: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      rest: number;
      muscleGroups: string[];
    }[];
  }[];
}

export default function BuilderPage() {
  const [folders, setFolders] = useState<string[]>([])
  const supabase = createClient()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [workoutType, setWorkoutType] = useState<string>("")
  const [workoutName, setWorkoutName] = useState("")
  const [isEditingName, setIsEditingName] = useState(true)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)
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
  const [recentTemplates, setRecentTemplates] = useState<WorkoutTemplate[]>([])
  const [view, setView] = useState<'folders' | 'all'>('folders')
  const [allTemplates, setAllTemplates] = useState<WorkoutTemplate[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [sharingTemplate, setSharingTemplate] = useState<WorkoutTemplate | null>(null)
  const [isTemplateViewerOpen, setIsTemplateViewerOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [pendingFolder, setPendingFolder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("builder")
  const [selectedSectionType, setSelectedSectionType] = useState<string>()
  const [selectedBuilderType, setSelectedBuilderType] = useState<'sets' | 'time' | 'circuit'>('sets')
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)

  const getNextSectionNumber = () => {
    const sections = workoutItems.filter(item => item.type === 'section')
    return sections.length + 1
  }

  const getSectionTitle = (index: number) => {
    if (index === 0) return "Warmup"
    return `Movement ${index}`
  }

  const handleExerciseSelect = (exercise: WorkoutExercise) => {
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
          { type: 'section', data: null, title: getSectionTitle(getNextSectionNumber() - 1) },
          { type: 'exercise', data: exercise }
        ])
      } else {
        setWorkoutItems(prev => [...prev, { type: 'exercise', data: exercise }])
      }
    }
  }

  const handleAddSection = () => {
    const newSectionIndex = workoutItems.length
    setWorkoutItems(prev => [...prev, { 
      type: 'section', 
      data: null, 
      title: getSectionTitle(getNextSectionNumber() - 1)
    }])
    setActiveSectionIndex(newSectionIndex)
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

  const handleRemoveSection = (sectionIndex: number) => {
    // Find the next section index or the end of the array
    let nextSectionIndex = -1
    for (let i = sectionIndex + 1; i < workoutItems.length; i++) {
      if (workoutItems[i].type === 'section') {
        nextSectionIndex = i
        break
      }
    }
    
    // If there's no next section, remove everything from this section to the end
    if (nextSectionIndex === -1) {
      setWorkoutItems(prev => prev.slice(0, sectionIndex))
      return
    }
    
    // Remove all items between this section and the next section
    setWorkoutItems(prev => {
      const newItems = [...prev]
      newItems.splice(sectionIndex, nextSectionIndex - sectionIndex)
      return newItems
    })
  }

  const handleSaveTemplate = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const templateData = {
      name: workoutName,
      type: workoutType,
      template: {
        name: workoutName,
        type: workoutType,
        sections: workoutItems.reduce((acc: any[], item, index) => {
          if (item.type === 'section') {
            acc.push({
              name: item.title || `Section ${index + 1}`,
              exercises: []
            })
          } else if (item.data && acc.length > 0) {
            acc[acc.length - 1].exercises.push({
              name: item.data.name,
              sets: item.data.sets,
              reps: item.data.reps,
              rest: item.data.rest,
              muscleGroups: item.data.muscleGroups
            })
          }
          return acc
        }, [])
      },
      is_public: isPublic,
      folder: selectedFolder || undefined,
      user_id: user.id
    }

    const result = await saveTemplate(templateData)
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Template saved successfully"
      })
      
      // Refresh templates
      await fetchTemplates()
      await fetchRecentTemplates()
      
      // Switch to templates tab
      setActiveTab("templates")
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

      // Fetch folders
      const { data: folderData, error: folderError } = await supabase
        .from('templates')
        .select('folder')
        .eq('user_id', user.id)
        .not('folder', 'is', null)

      // Fetch all templates
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!folderError && folderData) {
        const uniqueFolders = Array.from(new Set(folderData.map(d => d.folder))).filter(Boolean)
        setFolders(uniqueFolders)
      }

      if (!templateError && templateData) {
        setTemplates(templateData)
      }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder', folderName)

      if (error) throw error
      setTemplates(data)
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
      if (!user) return

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    }
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    setPendingFolder(newFolderName)
    setSelectedFolder(newFolderName)
    setNewFolderName("")
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
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setRecentTemplates(data)
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
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllTemplates(data)
    } catch (error) {
      console.error('Error fetching all templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    }
  }

  const handleTemplateSelect = async (template: Template | WorkoutTemplate) => {
    try {
      const items: WorkoutItem[] = []
      
      template.template.sections.forEach((section) => {
        items.push({
          type: 'section',
          data: null,
          title: section.name
        })
        
        section.exercises.forEach((exercise, index) => {
          const baseExercise = exercises.find((e: BaseExercise) => e.name === exercise.name)
          if (baseExercise) {
            items.push({
              type: 'exercise',
              data: {
                ...baseExercise,
                sets: exercise.sets,
                reps: exercise.reps,
                rest: exercise.rest,
                type: template.type,
                order: 'order' in exercise ? exercise.order : index
              }
            })
          }
        })
      })

      setWorkoutItems(items)
      setWorkoutType(template.type)
      setWorkoutName(template.name)
      setIsTemplateModalOpen(false)
    } catch (error) {
      console.error('Error loading template:', error)
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive"
      })
    }
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

  const handleShare = async (template: Template | WorkoutTemplate) => {
    setIsSharing(true)
    setSharingTemplate(template as WorkoutTemplate)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: threadError } = await supabase
        .from('threads')
        .insert({
          body: `Shared a workout template: ${template.name}`,
          user_id: user.id,
          thread_type: 'primary',
          shared_template: {
            workout_name: template.name,
            workout_type: template.type,
            sections: template.template.sections
          }
        })

      if (threadError) throw threadError

      toast({
        title: "Success",
        description: "Template shared successfully"
      })
    } catch (error) {
      console.error('Error sharing template:', error)
      toast({
        title: "Error",
        description: "Failed to share template",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
      setSharingTemplate(null)
      setIsTemplateViewerOpen(false)
    }
  }

  const TemplateCard = ({ template }: { template: WorkoutTemplate }) => (
    <Card 
      key={`${template.id}-${template.name}`}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => {
        setSelectedTemplate(template);
        setIsTemplateViewerOpen(true);
      }}
    >
      <h4 className="font-medium">{template.name}</h4>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline">
          {workoutTypes.find(t => t.id === template.type)?.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {template.template.sections.reduce((acc, section) => 
            acc + section.exercises.length, 0)} exercises
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation()
            handleShare(template)
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )

  // Transform folders array before passing to components
  const formattedFolders = folders.map(folder => ({
    name: folder,
    templates: templates.filter(t => t.folder === folder)
  }))

  // Update the workout type selection to set the builder type
  const handleWorkoutTypeSelect = (type: string) => {
    setWorkoutType(type)
    const workoutType = workoutTypes.find(t => t.id === type)
    if (workoutType) {
      setSelectedBuilderType(workoutType.builder)
    }
  }

  const handleSectionTypeChange = (sectionIndex: number, newType: string) => {
    setWorkoutItems(prev => prev.map((item, index) => {
      if (item.type === 'section' && index === sectionIndex) {
        return {
          ...item,
          sectionType: newType
        }
      }
      return item
    }))
    setActiveSectionIndex(sectionIndex)
  }

  const getActiveSectionType = () => {
    if (activeSectionIndex !== null) {
      const section = workoutItems[activeSectionIndex]
      if (section && section.type === 'section') {
        return section.sectionType || workoutType
      }
    }
    return workoutType
  }

  const handleAddExerciseClick = () => {
    // Find the current section index
    let currentSectionIndex = -1
    for (let i = workoutItems.length - 1; i >= 0; i--) {
      if (workoutItems[i].type === 'section') {
        currentSectionIndex = i
        break
      }
    }
    
    setActiveSectionIndex(currentSectionIndex)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8 transform-gpu">
      <h2 className="text-2xl font-semibold">Builder</h2>
      <p>
        The builder is a tool that allows you to create your own workouts.
        You can add exercises to your workout, and then save it as a template.
        You can then use the template to create a new workout.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">No folder</SelectItem>
                      {[...folders, ...(pendingFolder && !folders.includes(pendingFolder) ? [pendingFolder] : [])].map((folder) => (
                        <SelectItem 
                          key={`${folder}${folder === pendingFolder ? '-pending' : ''}`} 
                          value={folder}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {folder}
                            {folder === pendingFolder && <span className="text-muted-foreground ml-2">(pending)</span>}
                          </div>
                        </SelectItem>
                      ))}
                      <Separator className="my-2" />
                      <div className="p-2 flex gap-2">
                        <Input
                          placeholder="New folder name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="h-8"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim()}
                        >
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleSaveTemplate}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {workoutItems.length > 0 ? (
                <div className="space-y-4">
                  {selectedBuilderType === 'sets' ? (
                    <div className="space-y-4">
                      {workoutItems.map((item, index) => (
                        item.type === 'section' ? (
                          <div key={`section-${index}`} className="space-y-2">
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                              <Input 
                                placeholder={getSectionTitle(index)}
                                className="max-w-[200px] font-semibold border-none focus:border-input hover:border-input p-0"
                                value={item.title || getSectionTitle(index)}
                                onChange={(e) => handleSectionTitleChange(index, e.target.value)}
                              />
                              <Select 
                                value={item.sectionType || workoutType} 
                                onValueChange={(value) => handleSectionTypeChange(index, value)}
                              >
                                <SelectTrigger className="w-[140px]">
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto text-destructive"
                                onClick={() => handleRemoveSection(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Exercise</TableHead>
                                  {workoutTypes.find(t => t.id === (item.sectionType || workoutType))?.builder === 'sets' ? (
                                    <>
                                      <TableHead>Sets</TableHead>
                                      <TableHead>Reps</TableHead>
                                      <TableHead>Rest</TableHead>
                                    </>
                                  ) : (
                                    <>
                                      <TableHead>Work</TableHead>
                                      <TableHead>Rest</TableHead>
                                    </>
                                  )}
                                  <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {workoutItems
                                  .slice(index + 1)
                                  .filter((item) => item.type !== 'section')
                                  .map((exerciseItem, exerciseIndex) => (
                                    <TableRow 
                                      key={`${exerciseItem.data?.name}-${exerciseIndex}`}
                                      className={cn(
                                        "cursor-pointer hover:bg-muted/50",
                                        editingExerciseIndex === index + exerciseIndex + 1 && "bg-muted/50"
                                      )}
                                      onClick={() => handleRowClick(index + exerciseIndex + 1)}
                                    >
                                      <TableCell>{exerciseItem.data?.name}</TableCell>
                                      {workoutTypes.find(t => t.id === (item.sectionType || workoutType))?.builder === 'sets' ? (
                                        <>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              className="w-20"
                                              value={exerciseItem.data?.sets ?? ''}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? null : parseInt(e.target.value)
                                                setWorkoutItems(prev => prev.map((item, i) => 
                                                  i === index + exerciseIndex + 1 ? {
                                                    ...item,
                                                    data: item.data ? { ...item.data, sets: value } : null
                                                  } : item
                                                ))
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              className="w-20"
                                              value={exerciseItem.data?.reps ?? ''}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? null : parseInt(e.target.value)
                                                setWorkoutItems(prev => prev.map((item, i) => 
                                                  i === index + exerciseIndex + 1 ? {
                                                    ...item,
                                                    data: item.data ? { ...item.data, reps: value } : null
                                                  } : item
                                                ))
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              className="w-20"
                                              value={exerciseItem.data?.rest ?? ''}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? null : parseInt(e.target.value)
                                                setWorkoutItems(prev => prev.map((item, i) => 
                                                  i === index + exerciseIndex + 1 ? {
                                                    ...item,
                                                    data: item.data ? { ...item.data, rest: value } : null
                                                  } : item
                                                ))
                                              }}
                                            />s
                                          </TableCell>
                                        </>
                                      ) : (
                                        <>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              className="w-20"
                                              value={exerciseItem.data?.duration ?? ''}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? null : parseInt(e.target.value)
                                                setWorkoutItems(prev => prev.map((item, i) => 
                                                  i === index + exerciseIndex + 1 ? {
                                                    ...item,
                                                    data: item.data ? { ...item.data, duration: value } : null
                                                  } : item
                                                ))
                                              }}
                                            />s
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              className="w-20"
                                              value={exerciseItem.data?.rest ?? ''}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? null : parseInt(e.target.value)
                                                setWorkoutItems(prev => prev.map((item, i) => 
                                                  i === index + exerciseIndex + 1 ? {
                                                    ...item,
                                                    data: item.data ? { ...item.data, rest: value } : null
                                                  } : item
                                                ))
                                              }}
                                            />s
                                          </TableCell>
                                        </>
                                      )}
                                      <TableCell>
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleRowClick(index + exerciseIndex + 1)
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
                                              handleRemoveExercise(index + exerciseIndex + 1)
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : null
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workoutItems.map((item, index) => (
                        item.type === 'section' ? (
                          <div key={`section-${index}`} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <Input 
                              placeholder={getSectionTitle(index)}
                              className="max-w-[200px] font-semibold border-none focus:border-input hover:border-input p-0"
                              value={item.title || getSectionTitle(index)}
                              onChange={(e) => handleSectionTitleChange(index, e.target.value)}
                            />
                            <Select 
                              value={item.sectionType || workoutType} 
                              onValueChange={(value) => handleSectionTypeChange(index, value)}
                            >
                              <SelectTrigger className="w-[140px]">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto text-destructive"
                              onClick={() => handleRemoveSection(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Card key={`${item.data?.name}-${index}`} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h4 className="font-medium">{item.data?.name}</h4>
                                <div className="flex items-center gap-4">
                                  <div className="space-y-1">
                                    <Label>Work (seconds)</Label>
                                    <Input
                                      type="number"
                                      value={item.data?.duration ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value === '' ? null : parseInt(e.target.value)
                                        setWorkoutItems(prev => prev.map((item, i) => 
                                          i === index ? {
                                            ...item,
                                            data: item.data ? { ...item.data, duration: value } : null
                                          } : item
                                        ))
                                      }}
                                      className="w-24"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Rest (seconds)</Label>
                                    <Input
                                      type="number"
                                      value={item.data?.rest ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value === '' ? null : parseInt(e.target.value)
                                        setWorkoutItems(prev => prev.map((item, i) => 
                                          i === index ? {
                                            ...item,
                                            data: item.data ? { ...item.data, rest: value } : null
                                          } : item
                                        ))
                                      }}
                                      className="w-24"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRowClick(index)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleRemoveExercise(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={handleAddExerciseClick}
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Input 
                      placeholder="Section title"
                      className="max-w-[200px] font-semibold border-none focus:border-input hover:border-input p-0"
                      value="Warmup"
                      readOnly
                    />
                    <Select 
                      value={workoutType} 
                      onValueChange={handleWorkoutTypeSelect}
                    >
                      <SelectTrigger className="w-[140px]">
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
                    className="w-full" 
                    onClick={() => {
                      handleAddSection();
                      setIsModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              )}

              <ExerciseSelectorModal
                open={isModalOpen}
                onOpenChange={(open) => {
                  setIsModalOpen(open)
                  if (!open) setEditingExerciseIndex(null)
                }}
                onExerciseSelect={handleExerciseSelect}
                workoutType={getActiveSectionType()}
                editingExercise={editingExerciseIndex !== null ? workoutItems[editingExerciseIndex].data || undefined : undefined}
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
                  {recentTemplates.map((template: WorkoutTemplate) => (
                    <TemplateCard key={`${template.id}-${template.name}`} template={template} />
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
                      key={`folder-${folder}-${Date.now()}`}
                      open={openFolders.includes(folder)}
                      onOpenChange={() => toggleFolder(folder)}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-muted/50 p-2 rounded-md">
                        {openFolders.includes(folder) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <h3 className="font-medium">{folder}</h3>
                        <span className="text-muted-foreground ml-2">
                          ({templates.filter(t => t.folder === folder).length})
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-2">
                          {templates.filter(t => t.folder === folder).map((template) => (
                            <TemplateCard key={`${template.id}-${template.name}`} template={template} />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allTemplates.map((template: WorkoutTemplate) => (
                    <TemplateCard key={`${template.id}-${template.name}`} template={template} />
                  ))}
                </div>
              )}
            </div>
          </Card>

          <TemplateSelectorModal
            open={isTemplateModalOpen}
            onOpenChange={setIsTemplateModalOpen}
            templates={templates as unknown as Template[]}
            recentTemplates={recentTemplates as unknown as Template[]}
            onSelect={handleTemplateSelect}
            onShare={handleShare}
            sharingTemplate={sharingTemplate as unknown as Template}
            isSharing={isSharing}
          />
        </TabsContent>

        <TabsContent value="plans">
          <div className="space-y-6">
            <PlanBuilder />
          </div>
        </TabsContent>
      </Tabs>

      <TemplateViewerModal
        open={isTemplateViewerOpen}
        onOpenChange={setIsTemplateViewerOpen}
        template={selectedTemplate}
        onShare={handleShare}
        isSharing={isSharing}
        buttonText="Load Template"
      />
    </div>
  )
}
