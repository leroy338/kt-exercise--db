"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { workoutTypes } from "@/app/config/workout-types"
import { muscleGroups } from "@/app/config/muscle-groups"
import { Folder, ChevronRight, ChevronDown, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export interface Template {
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
  startTime?: string
}

interface TemplateSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Template[]
  recentTemplates: Template[]
  onSelect: (template: Template) => void
  onShare: (template: Template) => void
  sharingTemplate: Template | null
  isSharing: boolean
  actionText?: string
}

function organizeTemplatesByFolder(templates: Template[]) {
  const folderMap = templates.reduce((acc, template) => {
    const folderName = template.folder || 'Uncategorized'
    if (!acc[folderName]) {
      acc[folderName] = []
    }
    acc[folderName].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  return Object.entries(folderMap).map(([name, templates]) => ({
    name,
    templates,
    exerciseCount: templates.reduce((total, template) => 
      total + template.template.sections.reduce((sectionTotal, section) => 
        sectionTotal + section.exercises.length, 0
      ), 0
    )
  }))
}

export function TemplateSelectorModal({
  open,
  onOpenChange,
  templates,
  recentTemplates,
  onSelect,
  onShare,
  sharingTemplate,
  isSharing,
  actionText = "Add to Plan"
}: Omit<TemplateSelectorModalProps, 'folders'>) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentView, setCurrentView] = useState<'folders' | 'folder-content'>('folders')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const folders = organizeTemplatesByFolder(templates)

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName)
    setCurrentView('folder-content')
  }

  const handleBack = () => {
    setCurrentView('folders')
    setSelectedFolder(null)
  }

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template)
    setShowDetails(true)
  }

  const handleAddToPlan = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
      setShowDetails(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center">
              {currentView === 'folder-content' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={handleBack}
                >
                  ← Back
                </Button>
              )}
              <DialogTitle>
                {currentView === 'folders' 
                  ? "Select Workout Folder" 
                  : selectedFolder}
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            {currentView === 'folders' ? (
              <div className="space-y-8">
                {/* Folders Grid */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Folders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <Card 
                        key={folder.name}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleFolderClick(folder.name)}
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="h-5 w-5" />
                          <h4 className="font-semibold">{folder.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {folder.templates.length} templates
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {folder.exerciseCount} exercises
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Recent Templates Section */}
                {recentTemplates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recentTemplates.map((template) => (
                        <Card 
                          key={template.id}
                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => onSelect(template)}
                        >
                          <h4 className="font-semibold">{template.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline"
                              className={`bg-${workoutTypes.find(t => t.id === template.type)?.color} text-white`}
                            >
                              {workoutTypes.find(t => t.id === template.type)?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {template.template.sections.reduce((total: number, section: { exercises: any[] }) => 
                                total + section.exercises.length, 0)} exercises
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {folders
                  .find(f => f.name === selectedFolder)
                  ?.templates.map((template) => (
                    <Card 
                      key={template.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <h4 className="font-semibold">{template.name}</h4>
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
                    </Card>
                  ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {selectedTemplate?.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {selectedTemplate?.template.sections.reduce((total, section) => 
                  total + section.exercises.length, 0)} exercises
              </span>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[50vh]">
            <div className="space-y-4">
              {selectedTemplate?.template.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h3 className="font-medium">{section.name}</h3>
                  {section.exercises.map((exercise, exerciseIndex) => (
                    <div 
                      key={`${sectionIndex}-${exerciseIndex}`}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{exercise.sets} sets × {exercise.reps} reps</span>
                        <span>•</span>
                        <div className="flex gap-1">
                          {exercise.muscleGroups?.map(group => {
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

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToPlan}>
              {actionText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 