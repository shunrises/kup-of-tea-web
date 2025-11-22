import { createClient } from "@supabase/supabase-js"
import type { MusicGroup, Member } from "./types" // Assuming MusicGroup and Member are defined in a separate file

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 안전성을 위한 Database 타입 정의
export interface Database {
  public: {
    Tables: {
      music_groups: {
        Row: MusicGroup
        Insert: Omit<MusicGroup, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<MusicGroup, "id" | "created_at" | "updated_at">>
      }
      members: {
        Row: Member
        Insert: Omit<Member, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Member, "id" | "created_at" | "updated_at">>
      }
    }
  }
}
