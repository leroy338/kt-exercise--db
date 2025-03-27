"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { Button } from "@/components/ui/button"
import { Share2, Heart, MessageCircle, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/database.types"
import { Textarea } from "@/components/ui/textarea"

type Thread = Database['public']['Tables']['threads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface ThreadWithProfile extends Thread {
  profile: {
    first_name: string | null
    last_name: string | null
    handle: string | null
    avatar_url: string | null
  }
}

interface TemplateCardProps {
  template: {
    name: string
    type: string
    sections: {
      name: string
      exercises: {
        name: string
        sets: number
        reps: number
      }[]
    }[]
  }
}

function TemplateCard({ template }: TemplateCardProps) {
  const workoutType = workoutTypes.find(t => t.id === template.type)

  return (
    <Card className="p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{template.name}</h3>
          <Badge variant="outline">
            {workoutType?.label}
          </Badge>
        </div>
        <div className="space-y-2">
          {template.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-medium text-sm">{section.name}</h4>
              <div className="space-y-1">
                {section.exercises.map((exercise, exerciseIdx) => (
                  <div key={exerciseIdx} className="text-sm text-muted-foreground">
                    {exercise.name} - {exercise.sets}×{exercise.reps}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function NewThreadForm({ onThreadPosted }: { onThreadPosted: () => void }) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('threads')
        .insert({
          body: message.trim(),
          thread_type: 'primary',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      setMessage("")
      toast({
        title: "Success",
        description: "Thread posted successfully",
      })
      onThreadPosted() // Refresh the feed after successful post
    } catch (error: any) {
      console.error('Error posting thread:', error)
      toast({
        title: "Error",
        description: "Failed to post thread",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 md:left-[calc(50%+120px)]">
      <div className="bg-transparent backdrop-blur-md rounded-lg shadow-lg p-3">
        <div className="flex gap-2 items-center">
          <Textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[40px] max-h-[100px] resize-none bg-transparent text-sm"
          />
          <Button type="submit" disabled={isSubmitting || !message.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function Feed() {
  const [threads, setThreads] = useState<ThreadWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchThreads = async () => {
    try {
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profile:profiles (
            first_name,
            last_name,
            handle,
            avatar_url
          )
        `)
        .eq('thread_type', 'primary')
        .order('created_at', { ascending: false })

      if (threadsError) {
        console.error('Threads error details:', {
          message: threadsError.message,
          details: threadsError.details,
          code: threadsError.code,
          hint: threadsError.hint
        })
        throw threadsError
      }

      // Log the successful response
      console.log('Successful threads response:', {
        count: threadsData?.length || 0,
        firstThread: threadsData?.[0]
      })

      setThreads(threadsData || [])
    } catch (error: any) {
      // Improved error logging
      console.error('Full error object:', error)
      console.error('Error fetching threads:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      })
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [supabase, toast])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-32 space-y-6">
      {threads.map((thread) => (
        <Card key={thread.id} className="p-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={thread.profile?.avatar_url || undefined} />
              <AvatarFallback>
                {thread.profile?.first_name?.[0]}{thread.profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {thread.profile?.first_name} {thread.profile?.last_name}
                </span>
                {thread.profile?.handle && (
                  <span className="text-sm text-muted-foreground">
                    @{thread.profile.handle}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(thread.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="text-sm">{thread.body}</p>
              
              {thread.shared_template && (
                <TemplateCard template={thread.shared_template as TemplateCardProps['template']} />
              )}

              <div className="flex gap-4 mt-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  {thread.likes || 0}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      <NewThreadForm onThreadPosted={fetchThreads} />
    </div>
  )
} 