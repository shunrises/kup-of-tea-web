import useSWR from 'swr'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Team = Database['public']['Tables']['teams']['Row']

export const GroupSchema = z.object({
  name: z.string(),
  logo: z.string(),
  ticker: z.string().nullable().optional(),
})

export type Group = {
  name: string
  logo: string
  ticker: string | null
  groupType?:
    | 'boy_group'
    | 'girl_group'
    | 'coed_group'
    | 'male_solo'
    | 'female_solo'
}

export type GroupsResponse = Group[]

// Supabase에서 그룹 목록 가져오기
const fetchGroups = async (
  type: string,
  gender: string,
): Promise<GroupsResponse> => {
  const supabase = createClient()

  // type과 gender에 따라 필터링
  // type='group', gender='boy' -> group_type='boy_group'
  // type='group', gender='girl' -> group_type='girl_group'
  // type='group', gender='coed' -> group_type='coed_group'
  // type='solo', gender='boy' -> group_type='male_solo'
  // type='solo', gender='girl' -> group_type='female_solo'
  const groupTypeMap: Record<string, Record<string, string>> = {
    group: {
      boy: 'boy_group',
      girl: 'girl_group',
      coed: 'coed_group',
    },
    solo: {
      boy: 'male_solo',
      girl: 'female_solo',
    },
  }

  const groupType = groupTypeMap[type]?.[gender]

  let query = supabase.from('teams').select('name, logo, ticker, group_type')

  // groupType이 있으면 필터링
  if (groupType) {
    query = query.eq('group_type', groupType)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('Error fetching groups:', error)
    throw error
  }

  // 데이터 변환
  return (
    data?.map((team: Team) => ({
      name: team.name,
      logo: team.logo,
      ticker: team.ticker,
      groupType: team.group_type,
    })) || []
  )
}

// 특정 그룹 가져오기
const fetchGroup = async (ticker: string): Promise<Group | null> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('name, logo, ticker, group_type')
    .eq('ticker', ticker)
    .single()

  if (error) {
    console.error('Error fetching group:', error)
    return null
  }

  if (!data) return null

  return {
    name: data.name,
    logo: data.logo,
    ticker: data.ticker,
    groupType: data.group_type,
  }
}

export const useGroups = (type: string, gender: string) => {
  const { data, error, isLoading } = useSWR<GroupsResponse>(
    `groups/${type}/${gender}`,
    () => fetchGroups(type, gender),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    groups: data || [],
    isLoading,
    isError: error,
  }
}

export const useGroup = (ticker: string) => {
  const { data, error, isLoading } = useSWR<Group | null>(
    ticker ? `group/${ticker}` : null,
    () => fetchGroup(ticker),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    group: data || null,
    isLoading,
    isError: error,
  }
}
