import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type PendingTeam = Database['public']['Tables']['pending_teams']['Row']
type PendingArtistMember =
  Database['public']['Tables']['pending_artist_members']['Row']

export interface PendingTeamWithMembers extends PendingTeam {
  members: PendingArtistMember[]
}

/**
 * 승인 대기 중인 모든 팀 가져오기
 */
export const getPendingTeams = async (): Promise<PendingTeamWithMembers[]> => {
  const supabase = createClient()

  // pending_teams 가져오기
  const { data: pendingTeams, error: teamsError } = await supabase
    .from('pending_teams')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })

  if (teamsError) {
    console.error('Error fetching pending teams:', teamsError)
    throw teamsError
  }

  if (!pendingTeams || pendingTeams.length === 0) {
    return []
  }

  // 타입 단언
  const teams: PendingTeam[] = pendingTeams as PendingTeam[]

  // 각 팀의 멤버 가져오기
  const teamsWithMembers: PendingTeamWithMembers[] = await Promise.all(
    teams.map(async (team): Promise<PendingTeamWithMembers> => {
      const { data: members, error: membersError } = await supabase
        .from('pending_artist_members')
        .select('*')
        .eq('pending_team_id', team.id)
        .order('member_order', { ascending: true })

      if (membersError) {
        console.error('Error fetching pending members:', membersError)
        return { ...(team as PendingTeam), members: [] }
      }

      return {
        ...(team as PendingTeam),
        members: (members || []) as PendingArtistMember[],
      }
    }),
  )

  return teamsWithMembers
}

/**
 * 특정 pending team 가져오기
 */
export const getPendingTeam = async (
  id: number,
): Promise<PendingTeamWithMembers | null> => {
  const supabase = createClient()

  const { data: team, error: teamError } = await supabase
    .from('pending_teams')
    .select('*')
    .eq('id', id)
    .single()

  if (teamError || !team) {
    return null
  }

  const { data: members, error: membersError } = await supabase
    .from('pending_artist_members')
    .select('*')
    .eq('pending_team_id', id)
    .order('member_order', { ascending: true })

  if (membersError) {
    console.error('Error fetching pending members:', membersError)
    return { ...(team as PendingTeam), members: [] }
  }

  return {
    ...(team as PendingTeam),
    members: (members || []) as PendingArtistMember[],
  }
}

/**
 * 팀 승인 (서버 사이드에서만 실행 가능)
 * service_role 키가 필요하므로 API Route에서 호출해야 함
 */
export const approveTeam = async (
  pendingTeamId: number,
  reviewerName?: string,
): Promise<{ success: boolean; teamId?: number; error?: string }> => {
  // 클라이언트에서는 직접 실행 불가, API Route를 통해 호출
  const supabase = createClient()

  // 현재 세션 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { success: false, error: '인증이 필요합니다.' }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }

  const response = await fetch('/api/admin/approve-team', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pendingTeamId,
      reviewerName,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return { success: false, error: error.message || '승인 실패' }
  }

  const data = await response.json()
  return { success: true, teamId: data.teamId }
}

/**
 * 팀 거부 (서버 사이드에서만 실행 가능)
 */
export const rejectTeam = async (
  pendingTeamId: number,
  rejectionReason: string,
  reviewerName?: string,
): Promise<{ success: boolean; error?: string }> => {
  // 클라이언트에서는 직접 실행 불가, API Route를 통해 호출
  const supabase = createClient()

  // 현재 세션 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { success: false, error: '인증이 필요합니다.' }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }

  const response = await fetch('/api/admin/reject-team', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pendingTeamId,
      rejectionReason,
      reviewerName,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return { success: false, error: error.message || '거부 실패' }
  }

  return { success: true }
}
