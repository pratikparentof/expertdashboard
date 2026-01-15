export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'coach' | 'freelancer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'coach' | 'freelancer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'coach' | 'freelancer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          name: string
          age: number
          parent_id: string
          case_record_sheet_url: string | null
          assessment_viewer_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          parent_id: string
          case_record_sheet_url?: string | null
          assessment_viewer_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          parent_id?: string
          case_record_sheet_url?: string | null
          assessment_viewer_url?: string | null
          created_at?: string
        }
      }
      coach_children: {
        Row: {
          coach_id: string
          child_id: string
          created_at: string
        }
        Insert: {
          coach_id: string
          child_id: string
          created_at?: string
        }
        Update: {
          coach_id?: string
          child_id?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          coach_id: string
          child_id: string
          session_type: string
          session_date: string
          time_cst: string
          time_ist: string
          invitee_country: string | null
          invitee_timezone: string | null
          invitee_time: string | null
          status: 'upcoming' | 'completed' | 'missed' | 'rescheduled'
          meeting_link: string | null
          case_record_sheet_url: string | null
          assessment_viewer_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          child_id: string
          session_type: string
          session_date: string
          time_cst: string
          time_ist: string
          invitee_country?: string | null
          invitee_timezone?: string | null
          invitee_time?: string | null
          status?: 'upcoming' | 'completed' | 'missed' | 'rescheduled'
          meeting_link?: string | null
          case_record_sheet_url?: string | null
          assessment_viewer_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          child_id?: string
          session_type?: string
          session_date?: string
          time_cst?: string
          time_ist?: string
          invitee_country?: string | null
          invitee_timezone?: string | null
          invitee_time?: string | null
          status?: 'upcoming' | 'completed' | 'missed' | 'rescheduled'
          meeting_link?: string | null
          case_record_sheet_url?: string | null
          assessment_viewer_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      check_coach_child_access: {
        Args: { target_child_id: string }
        Returns: boolean
      }
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Parent = Database['public']['Tables']['parents']['Row']
export type Child = Database['public']['Tables']['children']['Row']
export type CoachChild = Database['public']['Tables']['coach_children']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
