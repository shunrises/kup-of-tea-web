import useSWR from 'swr'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type ArtistMember = Database['public']['Tables']['artist_members']['Row']

export const MemberSchema = z.object({
  name: z.string(),
  profileImage: z.string(),
})

export type Member = z.infer<typeof MemberSchema>

export type MembersResponse = Member[]

// Supabase에서 멤버 목록 가져오기
const fetchMembers = async (ticker: string): Promise<MembersResponse> => {
  const supabase = createClient()

  // ticker로 team을 찾고, 해당 team의 멤버들을 가져옴
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id')
    .eq('ticker', ticker)
    .single()

  if (teamError || !teamData) {
    console.error('Error fetching team:', teamError)
    return []
  }

  const { data, error } = await supabase
    .from('artist_members')
    .select('name, profile_image')
    .eq('team_id', teamData.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching members:', error)
    return []
  }

  // 데이터 변환 (snake_case -> camelCase)
  return (
    data
      ?.map((member: ArtistMember) => ({
        name: member.name || '',
        profileImage: member.profile_image || '',
      }))
      .filter((member: Member) => member.name && member.profileImage) || []
  )
}

export const useMembers = (ticker: string) => {
  const { data, error, isLoading } = useSWR<MembersResponse>(
    ticker ? `members/${ticker}` : null,
    () => fetchMembers(ticker),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    members: data || [],
    isLoading,
    isError: error,
  }
}
