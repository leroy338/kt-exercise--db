"use client"

import { useEffect, useState, useContext, createContext } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { workoutTypes } from "@/app/config/workout-types"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/database.types"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Thread = Database['public']['Tables']['threads']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface ThreadWithProfile extends Thread {
  profile: {
    first_name: string | null
    last_name: string | null
    handle: string | null
    avatar_url: string | null
  }
  replies?: ThreadWithProfile[]
  likes: number
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

  const handleCloneTemplate = () => {
    // TODO: Implement template cloning functionality
    console.log('Cloning template:', template.name)
  }

  return (
    <Card className="p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            <Badge variant="outline">
              {workoutType?.label}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCloneTemplate}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Clone Template
          </Button>
        </div>
        <Accordion type="multiple" className="w-full">
          {template.sections.map((section, idx) => (
            <AccordionItem key={idx} value={`section-${idx}`}>
              <AccordionTrigger className="text-sm hover:no-underline">
                {section.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {section.exercises.map((exercise, exerciseIdx) => (
                    <div key={exerciseIdx} className="text-sm text-muted-foreground flex justify-between items-center">
                      <span>{exercise.name}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-md">
                        {exercise.sets}×{exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  )
}

function NewThreadForm({ onThreadPosted, replyTo, onCancelReply }: { 
  onThreadPosted: () => void
  replyTo?: { 
    id: number
    author: string 
  } | null
  onCancelReply?: () => void
}) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('Creating reply with parent_thread_id:', replyTo?.id)

      const { error } = await supabase
        .from('threads')
        .insert({
          body: message.trim(),
          thread_type: replyTo ? 'reply' : 'primary',
          parent_thread_id: replyTo?.id || null,
          user_id: user.id
        })

      if (error) {
        console.error('Error creating reply:', error)
        throw error
      }

      setMessage("")
      toast({
        title: "Success",
        description: replyTo ? "Reply posted successfully" : "Thread posted successfully",
      })
      onThreadPosted() // Refresh the feed after successful post
      if (replyTo && onCancelReply) {
        onCancelReply()
      }
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
        {replyTo && (
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>Replying to {replyTo.author}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancelReply}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <Textarea
            placeholder={replyTo ? "Write your reply..." : "What's on your mind?"}
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

function ThreadCard({ thread, level = 0, onThreadDeleted }: { thread: ThreadWithProfile, level?: number, onThreadDeleted: () => void }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  // Get likedThreads from Feed component context
  const { likedThreads, setLikedThreads } = useContext(FeedContext)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // First, delete all replies to this thread
      if (thread.replies && thread.replies.length > 0) {
        const { error: repliesError } = await supabase
          .from('threads')
          .delete()
          .eq('parent_thread_id', thread.id)

        if (repliesError) throw repliesError
      }

      // Then delete the thread itself
      const { error: threadError } = await supabase
        .from('threads')
        .delete()
        .eq('id', thread.id)
        .eq('user_id', user.id)

      if (threadError) throw threadError

      toast({
        title: "Success",
        description: "Thread deleted successfully",
      })
      
      // Refresh the feed
      onThreadDeleted()
    } catch (error: any) {
      console.error('Error deleting thread:', error)
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = async (threadId: number) => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    try {
      if (likedThreads.includes(threadId)) {
        // Unlike logic...
      } else {
        // Like logic...
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className={level > 0 ? "ml-12" : ""}>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={thread.profile?.avatar_url || undefined} />
              <AvatarFallback>
                {thread.profile?.first_name?.[0]}{thread.profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
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
                {thread.user_id === currentUserId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-muted-foreground hover:text-destructive"
                        disabled={isDeleting}
                      >
                        ×
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this thread? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="text-sm">{thread.body}</p>
              
              {thread.shared_template && (
                <TemplateCard template={thread.shared_template as TemplateCardProps['template']} />
              )}

              <div className="flex gap-4 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleLike(thread.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${likedThreads.includes(thread.id) ? 'fill-current text-red-500' : ''}`} 
                  />
                  {thread.likes || 0}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </Button>
              </div>

              {showReplyForm && (
                <div className="mt-4">
                  <NewThreadForm 
                    onThreadPosted={() => {
                      setShowReplyForm(false)
                      // Refresh the parent component
                    }}
                    replyTo={{
                      id: thread.id,
                      author: `${thread.profile?.first_name} ${thread.profile?.last_name}`
                    }}
                    onCancelReply={() => setShowReplyForm(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      {thread.replies && thread.replies.length > 0 && (
        <div className="space-y-4">
          {thread.replies.map((reply) => (
            <ThreadCard key={reply.id} thread={reply} level={level + 1} onThreadDeleted={onThreadDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}

// Create context for sharing liked threads state
const FeedContext = createContext<{
  likedThreads: number[]
  setLikedThreads: (threads: number[] | ((prev: number[]) => number[])) => void
}>({
  likedThreads: [],
  setLikedThreads: () => {},
})

export default function FeedWithContext() {
  const [likedThreads, setLikedThreads] = useState<number[]>([])

  return (
    <FeedContext.Provider value={{ likedThreads, setLikedThreads }}>
      <Feed />
    </FeedContext.Provider>
  )
}

function Feed() {
  const [threads, setThreads] = useState<ThreadWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [likedThreads, setLikedThreads] = useState<number[]>([])
  const supabase = createClient()
  const { toast } = useToast()

  const fetchThreads = async () => {
    try {
      // First, fetch all primary threads
      const { data: primaryThreads, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profile:profiles (
            first_name,
            last_name,
            handle,
            avatar_url
          ),
          likes:thread_likes(count)
        `)
        .is('parent_thread_id', null)
        .order('created_at', { ascending: false })

      if (threadsError) throw threadsError

      // Then, fetch all replies in a single query
      const { data: allReplies, error: repliesError } = await supabase
        .from('threads')
        .select(`
          *,
          profile:profiles (
            first_name,
            last_name,
            handle,
            avatar_url
          ),
          likes:thread_likes(count)
        `)
        .not('parent_thread_id', 'is', null)
        .order('created_at', { ascending: true })

      if (repliesError) throw repliesError

      // Create a map of replies by parent_thread_id
      const repliesByParent = (allReplies || []).reduce((acc, reply) => {
        const parentId = reply.parent_thread_id
        if (!acc[parentId]) {
          acc[parentId] = []
        }
        acc[parentId].push({
          ...reply,
          likes: reply.likes?.[0]?.count || 0
        })
        return acc
      }, {} as Record<number, ThreadWithProfile[]>)

      // Associate replies with their parent threads
      const threadsWithReplies = (primaryThreads || []).map(thread => ({
        ...thread,
        likes: thread.likes?.[0]?.count || 0,
        replies: repliesByParent[thread.id] || []
      }))

      setThreads(threadsWithReplies)

      // Fetch user's liked threads
      const { data: userLikes } = await supabase
        .from('thread_likes')
        .select('thread_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      setLikedThreads(userLikes?.map(like => like.thread_id) || [])
    } catch (error: any) {
      console.error('Error fetching threads:', error)
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const onThreadDeleted = () => {
    fetchThreads()
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-20 pb-32 space-y-6">
      {threads.map((thread) => (
        <ThreadCard 
          key={thread.id} 
          thread={thread}
          onThreadDeleted={onThreadDeleted}
        />
      ))}
      <NewThreadForm onThreadPosted={fetchThreads} />
    </div>
  )
} 