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
}

interface TemplateSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Template[]
  folders: {name: string, templates: Template[]}[]
  recentTemplates: Template[]
  onSelect: (template: Template) => void
  onShare: (template: Template) => void
  sharingTemplate: Template | null
  isSharing: boolean
  actionText?: string
}

export function TemplateSelectorModal({
  open,
  onOpenChange,
  templates,
  folders,
  recentTemplates,
  onSelect,
  onShare,
  sharingTemplate,
  isSharing,
  actionText = "Add to Plan"
}: TemplateSelectorModalProps) {
  const [openFolders, setOpenFolders] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const toggleFolder = (folderName: string) => {
    setOpenFolders(current =>
      current.includes(folderName)
        ? current.filter(name => name !== folderName)
        : [...current, folderName]
    )
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
            <DialogTitle>Select Workout Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6">
              {/* Recent Templates Section */}
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
                          {template.template.sections.reduce((total, section) => 
                            total + section.exercises.length, 0)} exercises
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Folders Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Folders</h3>
                <div className="space-y-2">
                  {folders.map((folder) => (
                    <Collapsible
                      key={folder.name}
                      open={openFolders.includes(folder.name)}
                      onOpenChange={() => toggleFolder(folder.name)}
                    >
                      <CollapsibleTrigger className="flex items-center w-full p-2 hover:bg-muted rounded-md">
                        {openFolders.includes(folder.name) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="font-medium">{folder.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({folder.templates.length})
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-8 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {folder.templates.map((template) => (
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
                                  {template.template.sections.reduce((total, section) => 
                                    total + section.exercises.length, 0)} exercises
                                </span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline"
                className={`bg-${workoutTypes.find(t => t.id === selectedTemplate?.type)?.color} text-white`}
              >
                {workoutTypes.find(t => t.id === selectedTemplate?.type)?.label}
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
                          {exercise.muscleGroups.map(group => {
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