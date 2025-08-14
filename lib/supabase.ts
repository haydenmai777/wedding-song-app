import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          host_id: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          host_id: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          host_id?: string
          created_at?: string
          is_active?: boolean
        }
      }
      songs: {
        Row: {
          id: string
          event_id: string
          title: string
          artist: string
          votes: number
          created_at: string
          is_approved: boolean
          submitted_by: string | null
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          artist: string
          votes?: number
          created_at?: string
          is_approved?: boolean
          submitted_by?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          artist?: string
          votes?: number
          created_at?: string
          is_approved?: boolean
          submitted_by?: string | null
        }
      }
      votes: {
        Row: {
          id: string
          song_id: string
          voter_ip: string
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          voter_ip: string
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          voter_ip?: string
          created_at?: string
        }
      }
    }
  }
}
