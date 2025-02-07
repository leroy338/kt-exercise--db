"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save } from "lucide-react"

interface Profile {
  first_name: string
  last_name: string
  handle: string
  avatar_url: string
  email: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, handle, avatar_url')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      const profileData = {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        handle: data.handle || '',
        avatar_url: data.avatar_url || '',
        email: user.email || ''
      }

      setProfile(profileData)
      setEditForm(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editForm) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editForm.handle !== profile?.handle) {
        const { data: existingHandle } = await supabase
          .from('profiles')
          .select('handle')
          .eq('handle', editForm.handle)
          .neq('user_id', user.id)
          .single()

        if (existingHandle) {
          toast({
            title: "Error",
            description: "This username is already taken",
            variant: "destructive"
          })
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          handle: editForm.handle,
          avatar_url: editForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      setProfile(editForm)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleSave()
              } else {
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || '/avatars/default.png'} />
              <AvatarFallback>
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Input
                placeholder="Avatar URL"
                value={editForm?.avatar_url || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev!, avatar_url: e.target.value }))}
              />
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                {isEditing ? (
                  <Input
                    value={editForm?.first_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev!, first_name: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1">{profile?.first_name || '-'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                {isEditing ? (
                  <Input
                    value={editForm?.last_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev!, last_name: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1">{profile?.last_name || '-'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Username</label>
              {isEditing ? (
                <Input
                  value={editForm?.handle || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev!, handle: e.target.value }))}
                  placeholder="Choose a unique username"
                />
              ) : (
                <p className="mt-1">@{profile?.handle || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="mt-1">{profile?.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 