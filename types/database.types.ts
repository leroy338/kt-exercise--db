export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      broke_bros_form_submissions: {
        Row: {
          budget: string | null
          created_at: string
          description: string | null
          email: string | null
          first_name: string | null
          id: number
          last_name: string | null
          phone_number: string | null
          quote_form: boolean | null
          timeframe: string | null
          type: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number?: string | null
          quote_form?: boolean | null
          timeframe?: string | null
          type?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number?: string | null
          quote_form?: boolean | null
          timeframe?: string | null
          type?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          Electoral_Votes: number | null
          Height_Inches: number
          Major_Party: boolean | null
          Nominee: string | null
          Party: string
          Popular_Vote_Percentage: string | null
          Result: string | null
          Total_Votes: number | null
          Voter_Turnout: string | null
          Year: number
        }
        Insert: {
          Electoral_Votes?: number | null
          Height_Inches: number
          Major_Party?: boolean | null
          Nominee?: string | null
          Party: string
          Popular_Vote_Percentage?: string | null
          Result?: string | null
          Total_Votes?: number | null
          Voter_Turnout?: string | null
          Year: number
        }
        Update: {
          Electoral_Votes?: number | null
          Height_Inches?: number
          Major_Party?: boolean | null
          Nominee?: string | null
          Party?: string
          Popular_Vote_Percentage?: string | null
          Result?: string | null
          Total_Votes?: number | null
          Voter_Turnout?: string | null
          Year?: number
        }
        Relationships: []
      }
      envesti_analytics: {
        Row: {
          active_users: string | null
          ceu: string | null
          completed: boolean | null
          compliance_due_date: string | null
          course_title: string | null
          date_completed: string | null
          department: string | null
          first_name: string | null
          ID: number
          last_name: string | null
        }
        Insert: {
          active_users?: string | null
          ceu?: string | null
          completed?: boolean | null
          compliance_due_date?: string | null
          course_title?: string | null
          date_completed?: string | null
          department?: string | null
          first_name?: string | null
          ID: number
          last_name?: string | null
        }
        Update: {
          active_users?: string | null
          ceu?: string | null
          completed?: boolean | null
          compliance_due_date?: string | null
          course_title?: string | null
          date_completed?: string | null
          department?: string | null
          first_name?: string | null
          ID?: number
          last_name?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          part_name: string
          part_number: string
          quantity: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          part_name: string
          part_number: string
          quantity: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          part_name?: string
          part_number?: string
          quantity?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          department: string | null
          id: string
          phone: string | null
          state: string | null
          street_address: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      parts_directory: {
        Row: {
          created_at: string
          id: number
          name: string | null
          part_number: string | null
          price: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          part_number?: string | null
          price?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          part_number?: string | null
          price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          handle: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          phone: string | null
          platform: Database["public"]["Enums"]["platform"] | null
          role: string | null
          team_id: string | null
          team_name: string | null
          updated_at: string | null
          user_id: string | null
          user_level: Database["public"]["Enums"]["user_level"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          handle?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          platform?: Database["public"]["Enums"]["platform"] | null
          role?: string | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_level?: Database["public"]["Enums"]["user_level"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          handle?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          platform?: Database["public"]["Enums"]["platform"] | null
          role?: string | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_level?: Database["public"]["Enums"]["user_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_templates: {
        Row: {
          created_at: string | null
          id: string
          likes: number | null
          saves: number | null
          shared_by_user_id: string | null
          template: Json | null
          thread_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes?: number | null
          saves?: number | null
          shared_by_user_id?: string | null
          template?: Json | null
          thread_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          likes?: number | null
          saves?: number | null
          shared_by_user_id?: string | null
          template?: Json | null
          thread_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_templates_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_workouts: {
        Row: {
          created_at: string
          exercise_name: string
          folder: string | null
          id: number
          muscle_group: string
          reps: number
          rest: number
          section: number | null
          section_name: string | null
          sets: number
          user_id: string
          workout_id: number
          workout_name: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          folder?: string | null
          id?: number
          muscle_group: string
          reps: number
          rest: number
          section?: number | null
          section_name?: string | null
          sets: number
          user_id: string
          workout_id: number
          workout_name?: string | null
          workout_type: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          folder?: string | null
          id?: number
          muscle_group?: string
          reps?: number
          rest?: number
          section?: number | null
          section_name?: string | null
          sets?: number
          user_id?: string
          workout_id?: number
          workout_name?: string | null
          workout_type?: string
        }
        Relationships: []
      }
      "saved-workouts": {
        Row: {
          created_at: string
          exercise_name: string | null
          id: number
          muscle_group: string | null
          reps: number | null
          rest: number | null
          sets: number | null
          user_id: string | null
          workout_id: number
        }
        Insert: {
          created_at?: string
          exercise_name?: string | null
          id?: number
          muscle_group?: string | null
          reps?: number | null
          rest?: number | null
          sets?: number | null
          user_id?: string | null
          workout_id: number
        }
        Update: {
          created_at?: string
          exercise_name?: string | null
          id?: number
          muscle_group?: string | null
          reps?: number | null
          rest?: number | null
          sets?: number | null
          user_id?: string | null
          workout_id?: number
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          scheduled_for: string
          start_time: string | null
          template_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          scheduled_for: string
          start_time?: string | null
          template_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          scheduled_for?: string
          start_time?: string | null
          template_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_likes: {
        Row: {
          created_at: string | null
          id: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_likes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "public_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_saves: {
        Row: {
          created_at: string | null
          id: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_saves_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "public_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          folder: string | null
          id: number
          is_public: boolean | null
          name: string
          template: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder?: string | null
          id?: number
          is_public?: boolean | null
          name: string
          template: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder?: string | null
          id?: number
          is_public?: boolean | null
          name?: string
          template?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      thread_likes: {
        Row: {
          created_at: string
          id: number
          thread_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          thread_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          thread_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          author_avatar_url: string | null
          author_first_name: string | null
          author_handle: string | null
          author_last_name: string | null
          body: string
          created_at: string
          id: number
          likes: number | null
          parent_thread_id: number | null
          shared_template: Json | null
          thread_id: number | null
          thread_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_first_name?: string | null
          author_handle?: string | null
          author_last_name?: string | null
          body: string
          created_at?: string
          id?: never
          likes?: number | null
          parent_thread_id?: number | null
          shared_template?: Json | null
          thread_id?: number | null
          thread_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar_url?: string | null
          author_first_name?: string | null
          author_handle?: string | null
          author_last_name?: string | null
          body?: string
          created_at?: string
          id?: never
          likes?: number | null
          parent_thread_id?: number | null
          shared_template?: Json | null
          thread_id?: number | null
          thread_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string
          exercise_name: string
          id: number
          muscle_group: string
          reps: number
          reps_completed: number
          rest: number
          sets: number
          user_id: string
          weight: number
          workout_id: number
          workout_name: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: never
          muscle_group: string
          reps: number
          reps_completed: number
          rest: number
          sets: number
          user_id: string
          weight: number
          workout_id: number
          workout_name: string
          workout_type: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: never
          muscle_group?: string
          reps?: number
          reps_completed?: number
          rest?: number
          sets?: number
          user_id?: string
          weight?: number
          workout_id?: number
          workout_name?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_update_order_status:
        | {
            Args: Record<PropertyKey, never>
            Returns: undefined
          }
        | {
            Args: {
              updates: Json
            }
            Returns: undefined
          }
      get_completion_rate: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_distinct_folders: {
        Args: {
          user_id_param: string
        }
        Returns: string[]
      }
      get_orders_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          order_id: string
          status: string
          created_at: string
          items_count: number
          total_quantity: number
          company_name: string
          items: Json
        }[]
      }
      update_order_status: {
        Args: {
          p_order_id: string
          p_status: string
        }
        Returns: undefined
      }
      update_workout_folder: {
        Args: {
          p_workout_id: number
          p_folder_name: string
        }
        Returns: {
          updated_count: number
        }[]
      }
    }
    Enums: {
      plan: "champion" | "dealer" | "club" | "personal" | "vendor"
      platform: "champion" | "envesti"
      user_level:
        | "SuperAdmin"
        | "Parts"
        | "Sales"
        | "Technician"
        | "Admin"
        | "Organization"
        | "Personal"
        | "Club"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
