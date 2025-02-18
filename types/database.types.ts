type Tables = Database['public']['Tables']

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
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
          is_public: boolean
          created_at: string
          folder?: string
        }
        Insert: Omit<Tables['templates']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['templates']['Row']>
      }
      scheduled_workouts: {
        Row: {
          id: string
          user_id: string
          template_id: number
          scheduled_for: string
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<Tables['scheduled_workouts']['Row'], 'user_id' | 'template_id' | 'scheduled_for'>
        Update: Partial<Tables['scheduled_workouts']['Row']>
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
          user_level: string | null
          avatar_url: string | null
          organization_id: string | null
          role: string | null
          platform: string | null
          handle: string | null
          team_name: string | null
          team_id: string | null
        }
        Insert: Omit<Tables['profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['profiles']['Row']>
      }
      threads: {
        Row: {
          id: string
          user_id: string
          thread_id: string | null
          thread_type: 'primary' | 'secondary'
          body: string
          likes: number
          created_at: string
          author_first_name: string | null
          author_last_name: string | null
          author_handle: string | null
          author_avatar_url: string | null
        }
        Insert: Omit<Tables['threads']['Row'], 'id' | 'created_at' | 'likes'>
        Update: Partial<Tables['threads']['Row']>
      }
      thread_likes: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: Omit<Tables['thread_likes']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['thread_likes']['Row']>
      }
    }
  }
}