import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { verifyAdminForAPI } from '@/lib/supabase/auth'

/**
 * 팀 승인 API Route
 * service_role 키로 실행하여 보안 함수 호출
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인 (Supabase Auth 세션 기반)
    const authResult = await verifyAdminForAPI()

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pendingTeamId, reviewerName } = await request.json()

    if (!pendingTeamId) {
      return NextResponse.json(
        { error: 'pendingTeamId is required' },
        { status: 400 },
      )
    }

    // service_role 키로 Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 },
      )
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 승인 함수 호출
    const { data, error } = await supabase.rpc('approve_team', {
      pending_id: pendingTeamId,
      reviewer_name: reviewerName || null,
    })

    if (error) {
      console.error('Error approving team:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to approve team' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, teamId: data })
  } catch (error) {
    console.error('Error in approve-team API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
