import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

// Create a function to get the client lazily to avoid build-time errors
export function getSupabaseClient() {
  // Only create client on the browser
  if (typeof window === 'undefined') {
    // Return a mock during SSR/build that will be replaced on client
    return null as any
  }
  
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
    return null as any
  }
  
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// For backwards compatibility
export const supabase = null as any

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
