import type { Member } from '@/services/members'

export interface ArtistMember {
  id: number | null | undefined
  name: string | null | undefined
  profileImage: string | null | undefined
}

export interface Answer {
  id: string
  artistMember: ArtistMember | null | Member
}
