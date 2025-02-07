"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Send, ChevronDown, ChevronUp } from "lucide-react"
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
    handle: string
    avatar: string
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Thread[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Thread | null>(null)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
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
          handle: thread.author_handle || 'user',
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

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, handle, avatar_url')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        return
      }

      const threadData = {
        thread_type: replyingTo ? 'secondary' : 'primary' as 'primary' | 'secondary',
        body: newPost,
        user_id: user.id,
        thread_id: replyingTo?.id || null,
        author_first_name: profile?.first_name || '',
        author_last_name: profile?.last_name || '',
        author_handle: profile?.handle || 'user',
        author_avatar_url: profile?.avatar_url || '/avatars/default.png'
      }

      const { error } = await supabase
        .from('threads')
        .insert(threadData)

      if (error) throw error

      fetchThreads()
      setNewPost("")
      setReplyingTo(null)
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

  const toggleThread = async (threadId: string) => {
    const newExpandedThreads = new Set(expandedThreads)
    if (expandedThreads.has(threadId)) {
      newExpandedThreads.delete(threadId)
    } else {
      newExpandedThreads.add(threadId)
      // Fetch replies when expanding
      try {
        const { data: replies, error } = await supabase
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
          .eq('thread_id', threadId)
          .eq('thread_type', 'secondary')
          .order('created_at', { ascending: true })

        if (error) throw error

        // Add replies to posts
        setPosts(currentPosts => {
          const newPosts = [...currentPosts]
          const repliesFormatted = replies.map(reply => ({
            id: reply.id,
            thread_id: reply.thread_id,
            thread_type: reply.thread_type,
            user_id: reply.user_id,
            body: reply.body,
            likes: reply.likes,
            created_at: reply.created_at,
            isLiked: reply.thread_likes?.length > 0,
            author: {
              name: `${reply.author_first_name || ''} ${reply.author_last_name || ''}`.trim() || 'Anonymous',
              handle: reply.author_handle || 'user',
              avatar: reply.author_avatar_url || '/avatars/default.png'
            }
          }))
          return [...newPosts, ...repliesFormatted]
        })
      } catch (error) {
        console.error('Error fetching replies:', error)
      }
    }
    setExpandedThreads(newExpandedThreads)
  }

  if (loading) {
    return <div className="container mx-auto px-4 md:px-6 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-4">
        {posts
          .filter(post => post.thread_type === 'primary')
          .map(post => (
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      toggleThread(post.id)
                      if (!expandedThreads.has(post.id)) {
                        setReplyingTo(post)
                      }
                    }}
                  >
                    {expandedThreads.has(post.id) ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Replies Section */}
                {expandedThreads.has(post.id) && (
                  <div className="mt-4 pl-8 space-y-4 border-l-2">
                    {posts
                      .filter(reply => reply.thread_id === post.id)
                      .map(reply => (
                        <div key={reply.id} className="flex gap-4">
                          <Avatar>
                            <AvatarImage src={reply.author.avatar} />
                            <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{reply.author.name}</span>
                              <span className="text-muted-foreground">@{reply.author.handle}</span>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2">{reply.body}</p>
                            <div className="flex gap-6 mt-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleLike(reply.id)}
                                className={reply.isLiked ? "text-red-500" : ""}
                              >
                                <Heart className={`h-4 w-4 mr-2 ${reply.isLiked ? "fill-current" : ""}`} />
                                {reply.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New post input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-64">
        <div className="container mx-auto max-w-3xl">
          {replyingTo && (
            <div className="mb-2 text-sm text-muted-foreground">
              Replying to @{replyingTo.author.handle}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6"
                onClick={() => setReplyingTo(null)}
              >
                ×
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder={replyingTo ? "Write your reply..." : "What's on your mind?"}
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
      </div>
      
      <div className="h-20" />
    </div>
  )
} 