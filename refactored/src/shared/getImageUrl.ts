import { getR2ImageUrl } from '@/lib/cloudflare-r2'

/**
 * @deprecated Use getR2ImageUrl from '@/lib/cloudflare-r2' instead
 * 이 함수는 하위 호환성을 위해 유지되지만, 새로운 코드에서는 getR2ImageUrl을 사용하세요.
 */
export const getImageUrl = (url: string): string => {
  return getR2ImageUrl(url)
}
