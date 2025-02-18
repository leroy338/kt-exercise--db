"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LayoutList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"

interface Thread {
  id: string
  thread_id: string | null
  thread_type: 'primary' | 'secondary'
  user_id: string
  body: string
  likes: number
  created_at: string
  isLiked?: boolean
  author: {
    name: string
    handle: string
    avatar: string
  }
}

export function FeedDropdown() {
  const [posts, setPosts] = useState<Thread[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchThreads()
  }, [])

  async function fetchThreads() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: threads, error } = await supabase
        .from('threads')
        .select(`
          id,
          thread_id,
          thread_type,
          user_id,
          body,
          likes,
          created_at,
          author_first_name,
          author_last_name,
          author_handle,
          author_avatar_url,
          thread_likes(user_id)
        `)
        .eq('thread_type', 'primary')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setPosts(threads.map(thread => ({
        id: thread.id,
        thread_id: thread.thread_id,
        thread_type: thread.thread_type,
        user_id: thread.user_id,
        body: thread.body,
        likes: thread.likes,
        created_at: thread.created_at,
        isLiked: thread.thread_likes?.length > 0,
        author: {
          name: `${thread.author_first_name || ''} ${thread.author_last_name || ''}`.trim() || 'Anonymous',
          handle: thread.author_handle || 'user',
          avatar: thread.author_avatar_url || '/avatars/default.png'
        }
      })))
    } catch (error) {
      console.error('Error fetching threads:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <LayoutList className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-4">
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author.name}</span>
                    <span className="text-muted-foreground">@{post.author.handle}</span>
                  </div>
                  <p className="mt-2 text-sm">{post.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 