"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"

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
    username: string
    avatar: string
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Thread[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchThreads()
  }, [])

  async function fetchThreads() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        setLoading(false)
        return
      }
      
      console.log('Fetching threads...')
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

      if (error) {
        console.error('Error fetching threads:', error)
        throw error
      }

      console.log('Received threads:', threads)

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
          username: thread.author_handle || 'user',
          avatar: thread.author_avatar_url || '/avatars/default.png'
        }
      })))
    } catch (error) {
      console.error('Full error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log('Current user:', user)  // Debug log

      // First get the user's profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')  // Let's see all available fields first
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        })
        return
      }

      console.log('Full profile data:', profile)  // Debug log

      const { error } = await supabase
        .from('threads')
        .insert({
          thread_type: 'primary',
          body: newPost,
          user_id: user.id,
          author_first_name: profile?.first_name || '',
          author_last_name: profile?.last_name || '',
          author_handle: profile?.username || 'user',
          author_avatar_url: profile?.avatar_url || '/avatars/default.png'
        })

      if (error) {
        console.error('Error inserting thread:', error)  // Debug log
        throw error
      }

      fetchThreads()
      setNewPost("")
    } catch (error) {
      console.error('Full error:', error)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('thread_likes')
        .select('id')
        .eq('thread_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike && !post.isLiked) {
        console.log('Already liked')
        return
      }

      // Optimistically update UI
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                isLiked: !p.isLiked 
              }
            : p
        )
      )

      if (post.isLiked) {
        // Remove like
        await supabase
          .from('thread_likes')
          .delete()
          .eq('thread_id', postId)
          .eq('user_id', user.id)
      } else {
        // Add like
        const { error: likeError } = await supabase
          .from('thread_likes')
          .insert({
            thread_id: postId,
            user_id: user.id
          })

        if (likeError) throw likeError
      }

      // Update thread likes count
      const { error } = await supabase
        .from('threads')
        .update({ likes: post.isLiked ? post.likes - 1 : post.likes + 1 })
        .eq('id', postId)

      if (error) throw error

    } catch (error) {
      console.error('Error updating like:', error)
      fetchThreads()  // Revert on error
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 md:px-6 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
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
                  <span className="text-muted-foreground">@{post.author.username}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2">{post.body}</p>
                <div className="flex gap-6 mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={post.isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    0
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New post input - adjusted for sidebar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-64">
        <div className="container mx-auto max-w-3xl flex gap-2">
          <Input
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitPost()}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmitPost}
            disabled={!newPost.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Adjusted padding for sidebar and mobile */}
      <div className="h-20" />
    </div>
  )
} 