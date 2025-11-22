import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 팀 제출 API Route
 * group-form-creator에서 호출
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ticker, logo, groupPhoto, groupType, members, submittedBy } =
      body

    // 유효성 검사
    if (
      !name ||
      !ticker ||
      !logo ||
      !groupType ||
      !members ||
      members.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Required fields are missing (name, ticker, logo, groupType, members)',
        },
        { status: 400 },
      )
    }

    // groupType 유효성 검사
    const validGroupTypes = [
      'boy_group',
      'girl_group',
      'coed_group',
      'male_solo',
      'female_solo',
    ]
    if (!validGroupTypes.includes(groupType)) {
      return NextResponse.json({ error: 'Invalid groupType' }, { status: 400 })
    }

    // ticker 중복 확인 (이미 승인된 팀 또는 pending 팀)
    const supabase = await createClient()

    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('ticker', ticker)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Ticker already exists' },
        { status: 409 },
      )
    }

    const { data: existingPending } = await supabase
      .from('pending_teams')
      .select('id')
      .eq('ticker', ticker)
      .eq('status', 'pending')
      .single()

    if (existingPending) {
      return NextResponse.json(
        { error: 'Ticker is already pending approval' },
        { status: 409 },
      )
    }

    // pending_teams에 삽입
    const { data: pendingTeam, error: teamError } = await supabase
      .from('pending_teams')
      .insert({
        name,
        ticker,
        logo,
        group_photo: groupPhoto || '',
        group_type: groupType,
        submitted_by: submittedBy || null,
        status: 'pending',
      })
      .select()
      .single()

    if (teamError || !pendingTeam) {
      console.error('Error creating pending team:', teamError)
      return NextResponse.json(
        { error: 'Failed to submit team' },
        { status: 500 },
      )
    }

    // pending_artist_members에 삽입
    const membersData = members.map(
      (
        member: { name: string; profileImage: string | null },
        index: number,
      ) => ({
        pending_team_id: pendingTeam.id,
        name: member.name,
        profile_image: member.profileImage || null,
        member_order: index + 1,
      }),
    )

    const { error: membersError } = await supabase
      .from('pending_artist_members')
      .insert(membersData)

    if (membersError) {
      console.error('Error creating pending members:', membersError)
      // pending_team은 롤백하지 않고 그대로 둠 (수동 정리 필요)
      return NextResponse.json(
        { error: 'Failed to submit members' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        pendingTeamId: pendingTeam.id,
        message: 'Team submitted for approval',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error in submit-team API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
