// TypeScript 타입 정의
export interface MusicGroup {
  id: string
  name: string
  group_type: "female_solo" | "male_solo" | "coed_group" | "girl_group" | "boy_group"
  logo_image_url: string | null
  created_at: string
  updated_at: string
  members?: Member[]
}

export interface Member {
  id: string
  music_group_id: string
  name: string
  profile_image_url: string | null
  member_order: number
  created_at: string
  updated_at: string
}

// 폼에서 사용할 타입 (DB 저장 전)
export interface MusicGroupFormData {
  name: string
  group_type: "female_solo" | "male_solo" | "coed_group" | "girl_group" | "boy_group"
  logo_image: string | null // base64 또는 File
  members: MemberFormData[]
}

export interface MemberFormData {
  name: string
  profile_image: string | null // base64 또는 File
  order: number
}

// API 응답 타입
export interface MusicGroupWithMembers extends MusicGroup {
  members: Member[]
}
