"use client"

import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Folder, Share2, Pencil } from "lucide-react"
import { muscleGroups } from "@/app/config/muscle-groups"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { workoutTypes } from "@/app/config/workout-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Database } from "@/types/database.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EditTemplateModal } from "@/components/edit-template-modal"

type Template = Database['public']['Tables']['templates']['Row']
type ThreadInsert = Database['public']['Tables']['threads']['Insert']
type Json = Database['public']['Tables']['templates']['Row']['template']

interface TemplateSection {
  name: string
  exercises: {
    name: string
    sets: number
    reps: number
    rest: number
    muscleGroups: string[]
  }[]
}

interface TemplateStructure {
  sections: TemplateSection[]
}

function isTemplateStructure(json: unknown): json is TemplateStructure {
  if (typeof json !== 'object' || json === null) return false
  const obj = json as { sections?: unknown }
  if (!('sections' in obj) || !Array.isArray(obj.sections)) return false
  return true
}

interface ShareWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onShare: (message: string) => Promise<void>
}

function ShareWorkoutModal({ open, onOpenChange, template, onShare }: ShareWorkoutModalProps) {
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    try {
      setIsSharing(true)
      await onShare(message)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share workout",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  if (!template?.template) return null

  if (!isTemplateStructure(template.template)) return null
  const templateData = template.template

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Workout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Add a message about this workout..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Workout Preview</Label>
            <div className="space-y-4">
              {templateData.sections.map((section: TemplateSection, idx: number) => (
                <div key={idx}>
                  <h3 className="font-medium mb-2">{section.name}</h3>
                  <div className="space-y-2">
                    {section.exercises.map((exercise, exerciseIdx: number) => (
                      <div key={exerciseIdx} className="text-sm">
                        {exercise.name} - {exercise.sets}×{exercise.reps}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? "Sharing..." : "Share Workout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const WorkoutCard = ({ template, handleCardClick, handleStartWorkout, handleScheduleWorkout, handleShare, handleEdit, expandedTemplateId }: {
  template: Template
  handleCardClick: (id: number, e: React.MouseEvent) => void
  handleStartWorkout: (id: number) => void
  handleScheduleWorkout: (id: number) => void
  handleShare: (template: Template) => void
  handleEdit: (template: Template) => void
  expandedTemplateId: number | null
}) => {
  const workoutType = workoutTypes.find(t => t.id === template.type)
  
  if (!template.template || !isTemplateStructure(template.template)) {
    return null
  }

  const templateData = template.template as unknown as TemplateStructure
  
  return (
    <Card 
      key={`${template.id}-card`}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={(e) => handleCardClick(template.id, e)}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            <Badge 
              variant="outline"
              className={`bg-${workoutType?.color} text-white`}
            >
              {workoutType?.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{new Date(template.created_at).toLocaleDateString()}</span>
            <span>{templateData.sections.reduce((acc: number, section: TemplateSection) => 
              acc + section.exercises.length, 0)} exercises</span>
          </div>
        </div>

        {/* Expanded Content */}
        {expandedTemplateId === template.id && (
          <div className="space-y-4 border-t pt-4">
            {/* Muscle Groups */}
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(
                templateData.sections.flatMap((section: TemplateSection) => 
                  section.exercises.flatMap(exercise => exercise.muscleGroups)
                )
              )).map(group => {
                const muscleGroup = muscleGroups.find(g => g.id === group)
                return (
                  <Badge 
                    key={`${template.id}-${group}`} 
                    variant="secondary"
                    className={`${muscleGroup?.color} text-white`}
                  >
                    {muscleGroup?.label}
                  </Badge>
                )
              })}
            </div>

            {/* Exercises List */}
            {templateData.sections.map((section: TemplateSection, sectionIndex: number) => (
              <div key={`${template.id}-section-${sectionIndex}`} className="space-y-2">
                <h3 className="font-bold text-lg">{section.name}</h3>
                <div className="grid gap-2">
                  {section.exercises.map((exercise, exerciseIndex: number) => (
                    <div 
                      key={`${template.id}-section-${sectionIndex}-exercise-${exerciseIndex}`}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-muted-foreground">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-1 pt-2 border-t mt-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleStartWorkout(template.id) }}
            className="h-8 w-8"
            title="Start Workout"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleEdit(template) }}
            className="h-8 w-8"
            title="Edit Workout"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleScheduleWorkout(template.id) }}
            className="h-8 w-8"
            title="Schedule Workout"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleShare(template) }}
            className="h-8 w-8"
            title="Share Workout"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function SavedWorkouts() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)
  const [templateToShare, setTemplateToShare] = useState<Template | null>(null)

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to view your workouts",
          variant: "destructive"
        })
        router.push('/sign-in')
        return
      }

      const { data: templatesData, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [router, supabase, toast])

  useEffect(() => {
    async function fetchFolders() {
      try {
        const uniqueFolders = Array.from(
          new Set(templates
            .map(template => template.folder)
            .filter((folder): folder is string => folder !== undefined && folder !== null))
        )
        setFolders(uniqueFolders)
      } catch (error) {
        console.error('Error setting folders:', error)
      }
    }
    
    fetchFolders()
  }, [templates])

  const handleStartWorkout = (templateId: number) => {
    router.push(`/protected/workout/start/${templateId}`)
  }

  const handleScheduleWorkout = (templateId: number) => {
    router.push(`/protected/workout/schedule/${templateId}`)
  }

  const handleCardClick = (templateId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setExpandedTemplateId(expandedTemplateId === templateId ? null : templateId)
  }

  const handleRowClick = (templateId: number) => {
    setExpandedRowId(expandedRowId === templateId ? null : templateId)
  }

  const recentTemplates = templates.slice(0, 3)

  const paginatedTemplates = templates
    .filter(template => 
      selectedFolder === "all" || template.folder === selectedFolder
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(
    templates.filter(template => 
      selectedFolder === "all" || template.folder === selectedFolder
    ).length / itemsPerPage
  )

  const handleShareWorkout = async (message: string) => {
    if (!templateToShare?.template || !isTemplateStructure(templateToShare.template)) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Create a thread post with the template data
    const threadData: ThreadInsert = {
      body: message || `Shared a workout: ${templateToShare.name}`,
      user_id: user.id,
      thread_type: 'primary',
      shared_template: {
        name: templateToShare.name,
        type: templateToShare.type,
        sections: templateToShare.template.sections
      } as unknown as Json
    }

    const { error: threadError } = await supabase
      .from('threads')
      .insert(threadData)

    if (threadError) throw threadError

    toast({
      title: "Success",
      description: "Workout shared successfully"
    })
  }

  const handleEdit = (template: Template) => {
    setTemplateToEdit(template)
    setIsEditModalOpen(true)
  }

  const handleSave = () => {
    fetchTemplates()
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Workouts</h2>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-end">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Recent Workouts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTemplates.map((template) => (
                <WorkoutCard
                  key={template.id}
                  template={template}
                  handleCardClick={handleCardClick}
                  handleStartWorkout={handleStartWorkout}
                  handleScheduleWorkout={handleScheduleWorkout}
                  handleShare={setTemplateToShare}
                  handleEdit={handleEdit}
                  expandedTemplateId={expandedTemplateId}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">All Workouts</h2>
            <div className="flex items-center gap-4">
              <Select
                value={selectedFolder}
                onValueChange={(value) => setSelectedFolder(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead className="text-right">Exercises</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTemplates.map((template) => {
                    const workoutType = workoutTypes.find(t => t.id === template.type)
                    
                    if (!template.template || !isTemplateStructure(template.template)) {
                      return null
                    }

                    const templateData = template.template as unknown as TemplateStructure
                    const exerciseCount = templateData.sections.reduce(
                      (acc: number, section: TemplateSection) => acc + section.exercises.length, 
                      0
                    )
                    
                    return (
                      <React.Fragment key={template.id}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(template.id)}
                        >
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`bg-${workoutType?.color} text-white`}
                            >
                              {workoutType?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {template.folder ? (
                              <span className="text-muted-foreground">
                                {template.folder}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                No folder
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{exerciseCount}</TableCell>
                          <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleStartWorkout(template.id) }}
                                title="Start Workout"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleEdit(template) }}
                                title="Edit Workout"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleScheduleWorkout(template.id) }}
                                title="Schedule Workout"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setTemplateToShare(template) }}
                                title="Share Workout"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRowId === template.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50">
                              <div className="py-4 space-y-4">
                                {templateData.sections.map((section: TemplateSection, sectionIndex: number) => (
                                  <div key={`${template.id}-section-${sectionIndex}`} className="space-y-2">
                                    <h3 className="font-bold text-lg">{section.name}</h3>
                                    <div className="grid gap-2">
                                      {section.exercises.map((exercise, exerciseIndex: number) => (
                                        <div 
                                          key={`${template.id}-section-${sectionIndex}-exercise-${exerciseIndex}`}
                                          className="flex justify-between items-center text-sm"
                                        >
                                          <span className="font-medium">{exercise.name}</span>
                                          <span className="text-muted-foreground">
                                            {exercise.sets} × {exercise.reps}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {currentPage > 1 && (
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      />
                    )}
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    {currentPage < totalPages && (
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <Card
                key={folder}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/protected/saved-workouts/folder/${folder}`)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Folder className="h-12 w-12" />
                  <h3 className="font-medium">{folder}</h3>
                  <p className="text-sm text-muted-foreground">
                    {templates.filter(t => t.folder === folder).length} workouts
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ShareWorkoutModal
        open={!!templateToShare}
        onOpenChange={(open) => {
          if (!open) setTemplateToShare(null)
        }}
        template={templateToShare}
        onShare={handleShareWorkout}
      />

      <EditTemplateModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        template={templateToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
