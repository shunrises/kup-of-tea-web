'use client'

import { useEffect, useState } from 'react'
import { getPendingTeams, approveTeam, rejectTeam } from '@/services/approval'
import type { PendingTeamWithMembers } from '@/services/approval'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApprovalPageClientProps {
  userEmail?: string | null
}

export default function ApprovalPageClient({
  userEmail,
}: ApprovalPageClientProps) {
  const router = useRouter()
  const [pendingTeams, setPendingTeams] = useState<PendingTeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPendingTeams()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/admin/login')
    }
  }

  const loadPendingTeams = async () => {
    try {
      setLoading(true)
      const teams = await getPendingTeams()
      setPendingTeams(teams)
    } catch (err) {
      setError('승인 대기 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const handleApprove = async (pendingTeamId: number) => {
    if (!confirm('이 팀을 승인하시겠습니까?')) {
      return
    }

    setProcessing(pendingTeamId)
    try {
      const result = await approveTeam(pendingTeamId, userEmail || undefined)

      if (result.success) {
        alert('승인되었습니다!')
        loadPendingTeams()
      } else {
        alert(`승인 실패: ${result.error}`)
      }
    } catch (err) {
      alert('승인 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (pendingTeamId: number) => {
    const reason = prompt('거부 사유를 입력해주세요:')
    if (!reason) {
      return
    }

    setProcessing(pendingTeamId)
    try {
      const result = await rejectTeam(
        pendingTeamId,
        reason,
        userEmail || undefined,
      )

      if (result.success) {
        alert('거부되었습니다.')
        loadPendingTeams()
      } else {
        alert(`거부 실패: ${result.error}`)
      }
    } catch (err) {
      alert('거부 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">팀 승인 관리</h1>
          <p className="text-gray-600">
            승인 대기 중인 팀: {pendingTeams.length}개
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-1">관리자: {userEmail}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>

      {pendingTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          승인 대기 중인 팀이 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTeams.map((team) => (
            <div
              key={team.id}
              className="border rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{team.name}</h2>
                  <p className="text-gray-600">Ticker: {team.ticker}</p>
                  <p className="text-sm font-medium text-gray-700">
                    타입:{' '}
                    {team.group_type === 'boy_group'
                      ? '보이 그룹'
                      : team.group_type === 'girl_group'
                        ? '걸 그룹'
                        : team.group_type === 'coed_group'
                          ? '혼성 그룹'
                          : team.group_type === 'male_solo'
                            ? '남자 솔로'
                            : team.group_type === 'female_solo'
                              ? '여자 솔로'
                              : team.group_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    제출일:{' '}
                    {new Date(team.submitted_at).toLocaleString('ko-KR')}
                  </p>
                  {team.submitted_by && (
                    <p className="text-sm text-gray-500">
                      제출자: {team.submitted_by}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(team.id)}
                    disabled={processing === team.id}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {processing === team.id ? '처리 중...' : '승인'}
                  </button>
                  <button
                    onClick={() => handleReject(team.id)}
                    disabled={processing === team.id}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    거부
                  </button>
                </div>
              </div>

              {team.logo && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">로고:</p>
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-32 h-32 object-contain border rounded"
                  />
                </div>
              )}

              {team.group_photo && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">그룹 사진:</p>
                  <img
                    src={team.group_photo}
                    alt={`${team.name} 그룹 사진`}
                    className="w-64 h-64 object-contain border rounded"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">
                  멤버 ({team.members.length}명):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {team.members.map((member, index) => (
                    <div
                      key={member.id || index}
                      className="text-center border rounded p-3"
                    >
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={member.name || ''}
                          className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                          <span className="text-gray-400">이미지 없음</span>
                        </div>
                      )}
                      <p className="text-sm font-medium">{member.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
