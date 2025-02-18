"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface TeamMember {
  user_id: string
  first_name: string
  last_name: string
  handle: string
  avatar_url: string
  email: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Get the user's team info
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id, team_name')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError
      if (!userProfile?.team_id) {
        setLoading(false)
        return
      }

      setTeamName(userProfile.team_name || '')

      // Fetch all members of that team
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          handle,
          avatar_url,
          email
        `)
        .eq('team_id', userProfile.team_id)

      if (membersError) throw membersError
      if (!members) throw new Error('No team members found')
      
      setTeamMembers(members)
    } catch (error: any) {
      console.error('Error fetching team members:', error.message || error)
      toast({
        title: "Error",
        description: error.message || "Failed to load team members",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async () => {
    try {
      if (!newTeamName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a team name",
          variant: "destructive"
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user found')

      // Generate a new UUID for team_id
      const team_id = crypto.randomUUID()

      // Update the user's profile with the new team
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          team_id,
          team_name: newTeamName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Team created successfully"
      })

      // Reset state and refresh team members
      setNewTeamName("")
      setIsCreating(false)
      fetchTeamMembers()
    } catch (error: any) {
      console.error('Error creating team:', error.message || error)
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive"
      })
    }
  }

  const handleAddMember = async () => {
    try {
      if (!newMemberEmail.trim()) {
        toast({
          title: "Error",
          description: "Please enter an email address",
          variant: "destructive"
        })
        return
      }

      // Here you would typically send an invitation or add the user
      toast({
        title: "Success",
        description: "Invitation sent successfully"
      })
      setIsAddingMember(false)
      setNewMemberEmail("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!teamMembers.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          {isCreating ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Create a Team</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <Button onClick={createTeam}>Create</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">You are not part of a team yet.</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{teamName}</h2>
            {teamMembers.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIsAddingMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
          <div className="space-y-6">
            {teamMembers.map((member) => (
              <div key={member.user_id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar_url || '/avatars/default.png'} />
                  <AvatarFallback>
                    {member.first_name?.[0]}
                    {member.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">@{member.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to add to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Email address"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
