/**
 * @deprecated This file is no longer used.
 * API calls have been migrated to Supabase.
 * Use createClient() from '@/lib/supabase/client' instead.
 */

// 이 파일은 하위 호환성을 위해 유지되지만 더 이상 사용되지 않습니다.
export const fetcher = async (url: string) => {
  console.warn(
    'fetcher from services/base.ts is deprecated. Use Supabase client instead.',
  )
  return null
}
