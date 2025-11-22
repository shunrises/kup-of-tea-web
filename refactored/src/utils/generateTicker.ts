/**
 * 그룹 이름에서 ticker 생성
 * 예: "세븐틴" -> "svt"
 */
export function generateTicker(name: string): string {
  if (!name) return ''

  // 한글을 로마자로 변환하는 간단한 매핑 (실제로는 더 정교한 라이브러리 사용 가능)
  const koreanToRoman: Record<string, string> = {
    세븐틴: 'svt',
    아이즈원: 'izone',
    // 필요한 매핑 추가
  }

  // 이미 매핑이 있으면 그대로 사용
  if (koreanToRoman[name]) {
    return koreanToRoman[name].toLowerCase()
  }

  // 영어 이름인 경우 소문자로 변환
  if (/^[a-zA-Z\s]+$/.test(name)) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // 한글 이름인 경우 영문자 변환 시도 (간단한 변환)
  // 실제로는 한글->로마자 변환 라이브러리 사용 권장
  // 예: '세븐틴' -> 'svt' 같은 매핑 테이블 필요

  // 임시로 name을 기반으로 간단한 변환
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '')
    .slice(0, 10) // 최대 길이 제한
}
