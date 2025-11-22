import { requireAdmin, getCurrentUser } from '@/lib/supabase/auth'
import ApprovalPageClient from './approval-client'

export default async function ApprovalPage() {
  // 관리자 권한 확인
  await requireAdmin()

  // 현재 사용자 정보 가져오기
  const user = await getCurrentUser()

  return <ApprovalPageClient userEmail={user?.email} />
}
