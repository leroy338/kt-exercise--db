"use client"

import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Folder } from "lucide-react"
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

const WorkoutCard = ({ template, handleCardClick, handleStartWorkout, handleScheduleWorkout, expandedTemplateId }: {
  template: Template
  handleCardClick: (id: number, e: React.MouseEvent) => void
  handleStartWorkout: (id: number) => void
  handleScheduleWorkout: (id: number) => void
  expandedTemplateId: number | null
}) => {
  const workoutType = workoutTypes.find(t => t.id === template.type)
  
  return (
    <Card 
      key={`${template.id}-card`}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={(e) => handleCardClick(template.id, e)}
    >
      <div className="space-y-4">
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
            <span>{template.template.sections.reduce((acc, section) => 
              acc + section.exercises.length, 0)} exercises</span>
          </div>
        </div>

        {/* Expanded Content */}
        {expandedTemplateId === template.id && (
          <div className="space-y-4 border-t pt-4">
            {/* Muscle Groups */}
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(
                template.template.sections.flatMap(section => 
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
            {template.template.sections.map((section, sectionIndex) => (
              <div key={`${template.id}-section-${sectionIndex}`} className="space-y-2">
                <h3 className="font-bold text-lg">{section.name}</h3>
                <div className="grid gap-2">
                  {section.exercises.map((exercise, exerciseIndex) => (
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
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleStartWorkout(template.id) }}
            title="Start Workout"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleScheduleWorkout(template.id) }}
            title="Schedule Workout"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function SavedWorkouts() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
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
        setTemplates(templatesData)
      } catch (error) {
        console.error('Error fetching templates:', error)
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

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

  if (loading) {
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
                    const exerciseCount = template.template.sections.reduce(
                      (acc, section) => acc + section.exercises.length, 
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
                                onClick={(e) => { e.stopPropagation(); handleScheduleWorkout(template.id) }}
                                title="Schedule Workout"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRowId === template.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50">
                              <div className="py-4 space-y-4">
                                {template.template.sections.map((section, sectionIndex) => (
                                  <div key={`${template.id}-section-${sectionIndex}`} className="space-y-2">
                                    <h3 className="font-bold text-lg">{section.name}</h3>
                                    <div className="grid gap-2">
                                      {section.exercises.map((exercise, exerciseIndex) => (
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
    </div>
  )
}
