import { createClient } from './server'
import { redirect } from 'next/navigation'

/**
 * 관리자 이메일 목록 (환경 변수에서 관리 가능)
 * 쉼표로 구분된 이메일 목록 또는 특정 패턴
 */
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || ''
  if (adminEmailsEnv) {
    return adminEmailsEnv.split(',').map((email) => email.trim())
  }
  return []
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return false
  }

  const adminEmails = getAdminEmails()
  if (adminEmails.length === 0) {
    // 관리자 이메일이 설정되지 않은 경우, 모든 인증된 사용자를 관리자로 간주
    return true
  }

  return adminEmails.includes(user.email)
}

/**
 * 관리자 권한 확인 및 리다이렉트
 * 서버 컴포넌트에서 사용
 */
export async function requireAdmin() {
  const isAdminUser = await isAdmin()
  if (!isAdminUser) {
    redirect('/admin/login')
  }
}

/**
 * 현재 인증된 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * API Route에서 사용할 수 있는 관리자 확인 함수
 */
export async function verifyAdminForAPI(): Promise<{
  isAdmin: boolean
  userEmail?: string
  userId?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.email) {
    return { isAdmin: false }
  }

  const adminEmails = getAdminEmails()
  const isAdminUser =
    adminEmails.length === 0 || adminEmails.includes(user.email)

  return {
    isAdmin: isAdminUser,
    userEmail: user.email,
    userId: user.id,
  }
}
