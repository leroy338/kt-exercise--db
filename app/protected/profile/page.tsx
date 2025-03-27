"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, Clock, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserTimezone, formatDate } from "@/utils/date"

interface Profile {
  id: string
  first_name: string
  last_name: string
  handle: string
  avatar_url: string
  email: string
  team_id?: string
  team_name?: string
  timezone?: string
  user_id?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("")
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const supabase = createClient()
  const { toast } = useToast()

  // Get all available timezones
  const timezones = Intl.supportedValuesOf('timeZone')

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!profile) return

    const updateCurrentTime = () => {
      const now = new Date()
      const formattedTime = formatDate(now, profile.timezone || browserTimezone)
      setCurrentTime(formattedTime)
    }
    
    // Update immediately
    updateCurrentTime()
    
    // Update every second
    const interval = setInterval(updateCurrentTime, 1000)
    
    return () => clearInterval(interval)
  }, [profile?.timezone])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // First check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      let profileData: Profile

      if (!existingProfile) {
        // Create new profile if one doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            email: user.email,
            timezone: browserTimezone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('*')
          .single()

        if (insertError) throw insertError
        if (!newProfile) throw new Error('Failed to create profile')

        profileData = {
          id: newProfile.id,
          first_name: '',
          last_name: '',
          handle: '',
          avatar_url: '',
          email: user.email || '',
          team_id: '',
          team_name: '',
          timezone: browserTimezone,
          user_id: user.id
        }
      } else {
        profileData = {
          id: existingProfile.id,
          first_name: existingProfile.first_name || '',
          last_name: existingProfile.last_name || '',
          handle: existingProfile.handle || '',
          avatar_url: existingProfile.avatar_url || '',
          email: user.email || '',
          team_id: existingProfile.team_id || '',
          team_name: existingProfile.team_name || '',
          timezone: existingProfile.timezone || browserTimezone,
          user_id: existingProfile.user_id
        }
      }

      setProfile(profileData)
      setEditForm(profileData)
    } catch (error: any) {
      console.error('Error fetching profile:', error.message || error)
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
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

      // Check for existing handle only if it changed
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

      // Update existing profile
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          handle: editForm.handle,
          avatar_url: editForm.avatar_url,
          team_name: editForm.team_name,
          timezone: editForm.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (error) throw error

      // Make sure we maintain the ID in the profile state
      const updatedProfileData = {
        ...editForm,
        ...(updatedProfile || {}),
      }

      setProfile(updatedProfileData)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })

      // Refresh the profile data
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  const updateTimezone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          timezone: browserTimezone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (error) throw error

      if (updatedProfile) {
        setProfile(prev => prev ? { ...prev, timezone: browserTimezone } : null)
        toast({
          title: "Success",
          description: "Timezone updated to browser's timezone"
        })
      }
    } catch (error) {
      console.error('Error updating timezone:', error)
      toast({
        title: "Error",
        description: "Failed to update timezone"
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

            <div>
              <label className="text-sm font-medium">Team</label>
              {isEditing ? (
                <Input
                  value={editForm?.team_name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev!, team_name: e.target.value }))}
                  placeholder="Enter team name"
                />
              ) : (
                <p className="mt-1">{profile?.team_name || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Timezone</label>
              {isEditing ? (
                <Select
                  value={editForm?.timezone}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev!, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <p>{profile?.timezone || browserTimezone}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updateTimezone}
                    title="Update to browser timezone"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col gap-3 items-center text-center text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Profile ID:</span>
              <code className="px-1.5 py-0.5 bg-muted rounded font-mono">
                {profile?.id || 'Not available'}
              </code>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Team:</span>
              <code className="px-1.5 py-0.5 bg-muted rounded font-mono">
                {profile?.team_name || 'No team'}
              </code>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Current Time:</span>
              <code className="px-1.5 py-0.5 bg-muted rounded font-mono">
                {currentTime || 'Loading...'}
              </code>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 