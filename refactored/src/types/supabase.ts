export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artist_members: {
        Row: {
          created_at: string
          id: number
          name: string | null
          profile_image: string | null
          team_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          profile_image?: string | null
          team_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          profile_image?: string | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'artist_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          group_photo: string
          group_type:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          id: number
          logo: string
          name: string
          ticker: string
        }
        Insert: {
          created_at?: string
          group_photo: string
          group_type:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          id?: number
          logo: string
          name: string
          ticker: string
        }
        Update: {
          created_at?: string
          group_photo?: string
          group_type?:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          id?: number
          logo?: string
          name?: string
          ticker?: string
        }
        Relationships: []
      }
      pending_teams: {
        Row: {
          id: number
          name: string
          ticker: string
          logo: string
          group_photo: string
          group_type:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          status: 'pending' | 'approved' | 'rejected'
          submitted_by: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          ticker: string
          logo: string
          group_photo?: string
          group_type:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          status?: 'pending' | 'approved' | 'rejected'
          submitted_by?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          ticker?: string
          logo?: string
          group_photo?: string
          group_type?:
            | 'boy_group'
            | 'girl_group'
            | 'coed_group'
            | 'male_solo'
            | 'female_solo'
          status?: 'pending' | 'approved' | 'rejected'
          submitted_by?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_artist_members: {
        Row: {
          id: number
          pending_team_id: number
          team_id: number | null
          name: string
          profile_image: string | null
          member_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          pending_team_id: number
          team_id?: number | null
          name: string
          profile_image?: string | null
          member_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          pending_team_id?: number
          team_id?: number | null
          name?: string
          profile_image?: string | null
          member_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pending_artist_members_pending_team_id_fkey'
            columns: ['pending_team_id']
            isOneToOne: false
            referencedRelation: 'pending_teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pending_artist_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_team: {
        Args: {
          pending_id: number
          reviewer_name?: string | null
        }
        Returns: number
      }
      reject_team: {
        Args: {
          pending_id: number
          rejection_reason: string
          reviewer_name?: string | null
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
