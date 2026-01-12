export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: number
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          id: string
          message: string
          type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          message: string
          type?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          message?: string
          type?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      hints: {
        Row: {
          id: string
          problem_id: string
          content: string
          unlock_after_minutes: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          content: string
          unlock_after_minutes?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          content?: string
          unlock_after_minutes?: number
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hints_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          }
        ]
      }
      problems: {
        Row: {
          id: string
          round_number: number
          problem_code: string
          title: string
          statement: string
          guidance: string | null
          sort_order: number
          individual_time_limit_seconds: number | null
          points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          round_number: number
          problem_code: string
          title: string
          statement: string
          guidance?: string | null
          sort_order?: number
          individual_time_limit_seconds?: number | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          round_number?: number
          problem_code?: string
          title?: string
          statement?: string
          guidance?: string | null
          sort_order?: number
          individual_time_limit_seconds?: number | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_round_number_fkey"
            columns: ["round_number"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["round_number"]
          }
        ]
      }
      rounds: {
        Row: {
          id: number
          round_number: number
          title: string
          type: string
          status: string
          duration_minutes: number | null
          is_unlocked: boolean
          timer_active: boolean
          timer_started_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          round_number: number
          title: string
          type?: string
          status?: string
          duration_minutes?: number | null
          is_unlocked?: boolean
          timer_active?: boolean
          timer_started_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          round_number?: number
          title?: string
          type?: string
          status?: string
          duration_minutes?: number | null
          is_unlocked?: boolean
          timer_active?: boolean
          timer_started_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_progress: {
        Row: {
          id: string
          team_id: string
          problem_id: string
          is_solved: boolean
          is_locked: boolean
          locked_at: string | null
          current_problem_started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          problem_id: string
          is_solved?: boolean
          is_locked?: boolean
          locked_at?: string | null
          current_problem_started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          problem_id?: string
          is_solved?: boolean
          is_locked?: boolean
          locked_at?: string | null
          current_problem_started_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_progress_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      team_round_state: {
        Row: {
          id: string
          team_id: string
          round_number: number
          current_problem_id: string | null
          round_started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          round_number: number
          current_problem_id?: string | null
          round_started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          round_number?: number
          current_problem_id?: string | null
          round_started_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_round_state_current_problem_id_fkey"
            columns: ["current_problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_round_state_round_number_fkey"
            columns: ["round_number"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["round_number"]
          },
          {
            foreignKeyName: "team_round_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          session_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          session_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
