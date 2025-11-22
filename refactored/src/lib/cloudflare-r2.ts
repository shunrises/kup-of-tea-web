/**
 * Cloudflare R2 이미지 URL 처리
 *
 * R2 버킷의 이미지를 Cloudflare CDN을 통해 제공합니다.
 * 무료 tier에서 최대한 효율적으로 사용하기 위해 CDN 캐싱을 활용합니다.
 */

export const getR2ImageUrl = (
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  },
): string => {
  // Cloudflare CDN 도메인 (사용자가 설정)
  const cdnDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN || ''

  // 기본 이미지 URL
  if (!path || path === '/empty.jpg' || path === 'empty.jpg') {
    return '/empty.jpg'
  }

  // 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // R2 버킷 경로 정규화 (앞에 /가 없으면 추가)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Cloudflare CDN을 통한 이미지 URL
  let imageUrl = `${cdnDomain}${normalizedPath}`

  // 이미지 최적화 옵션이 있는 경우 (Cloudflare Image Resizing 사용)
  if (options && (options.width || options.height || options.quality)) {
    const params = new URLSearchParams()
    if (options.width) params.set('width', options.width.toString())
    if (options.height) params.set('height', options.height.toString())
    if (options.quality) params.set('quality', options.quality.toString())
    if (options.format) params.set('format', options.format)

    imageUrl = `${imageUrl}?${params.toString()}`
  }

  return imageUrl
}

/**
 * 프로필 이미지 URL 생성
 */
export const getProfileImageUrl = (
  profileImage: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium',
): string => {
  if (
    !profileImage ||
    profileImage === '/empty.jpg' ||
    profileImage === 'empty.jpg'
  ) {
    return '/empty.jpg'
  }

  const sizeMap = {
    small: 64,
    medium: 128,
    large: 256,
  }

  return getR2ImageUrl(profileImage, {
    width: sizeMap[size],
    height: sizeMap[size],
    quality: 85,
    format: 'webp',
  })
}

/**
 * 그룹 로고 URL 생성
 */
export const getLogoUrl = (
  logo: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium',
): string => {
  if (!logo) return '/empty.jpg'

  const sizeMap = {
    small: 48,
    medium: 96,
    large: 192,
  }

  return getR2ImageUrl(logo, {
    width: sizeMap[size],
    height: sizeMap[size],
    quality: 90,
    format: 'webp',
  })
}
