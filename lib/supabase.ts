import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'teacher'
          created_at: string
          is_approved: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher'
          is_approved?: boolean
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher'
          is_approved?: boolean
        }
      }
      exam_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          submitted_at: string | null
          answers: Record<string, string>
          score: number | null
          total_points: number | null
          tab_switches: number
          is_submitted: boolean
          warnings: string[]
        }
        Insert: {
          id?: string
          user_id: string
          answers?: Record<string, string>
          tab_switches?: number
          warnings?: string[]
        }
        Update: {
          answers?: Record<string, string>
          score?: number | null
          total_points?: number | null
          tab_switches?: number
          is_submitted?: boolean
          submitted_at?: string | null
          warnings?: string[]
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          action: string
          details: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          session_id?: string | null
          action: string
          details?: string | null
        }
        Update: never
      }
    }
  }
}
