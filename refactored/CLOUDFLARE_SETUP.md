# Cloudflare R2 및 CDN 설정 가이드

이 프로젝트는 이미지 파일을 Cloudflare R2에 저장하고 CDN을 통해 제공합니다. 이를 통해 Vercel의 이미지 호출 제한을 피하고 무료 tier에서 효율적으로 운영할 수 있습니다.

## 1. Cloudflare R2 버킷 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. 왼쪽 메뉴에서 **R2** 선택
3. **Create bucket** 클릭
4. 버킷 이름 입력 (예: `kup-of-tea-images`)
5. **Create bucket** 클릭

## 2. R2 버킷에 이미지 업로드

### 방법 1: Cloudflare Dashboard 사용

1. 생성한 버킷 클릭
2. **Upload** 버튼 클릭
3. 이미지 파일 업로드

### 방법 2: R2 API 사용

```bash
# R2 액세스 키 생성 (Dashboard > R2 > Manage R2 API Tokens)
# 환경 변수 설정
export R2_ACCOUNT_ID="your-account-id"
export R2_ACCESS_KEY_ID="your-access-key-id"
export R2_SECRET_ACCESS_KEY="your-secret-access-key"
export R2_BUCKET_NAME="kup-of-tea-images"

# aws-cli를 사용한 업로드 (R2는 S3 호환 API 사용)
aws s3 cp ./images/ s3://kup-of-tea-images/ --recursive \
  --endpoint-url=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

## 3. R2 퍼블릭 액세스 설정

기본적으로 R2 버킷은 비공개입니다. CDN을 통해 접근하려면 퍼블릭 액세스를 설정해야 합니다.

### 옵션 1: R2 퍼블릭 도메인 사용 (무료)

1. R2 버킷 설정에서 **Settings** 탭 선택
2. **Public access** 섹션에서 **Allow Access** 활성화
3. Public URL 형식: `https://pub-xxxxx.r2.dev/your-image.jpg`

### 옵션 2: Cloudflare CDN 사용 (권장, 무료)

1. **Workers & Pages** > **Custom Domains** 이동
2. R2 버킷에 커스텀 도메인 연결
3. 또는 Workers를 사용하여 R2를 프록시

## 4. Workers를 통한 R2 프록시 설정 (권장)

Workers를 사용하면 이미지 최적화와 캐싱을 더 효율적으로 할 수 있습니다.

### 4.1 Worker 생성

1. Cloudflare Dashboard > **Workers & Pages**
2. **Create application** > **Create Worker** 선택
3. Worker 이름 입력 (예: `r2-image-proxy`)

### 4.2 Worker 코드

```javascript
// Worker 코드 예시
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // R2 버킷에서 이미지 가져오기
    const object = await env.R2_BUCKET.get(path)

    if (!object) {
      return new Response('Not Found', { status: 404 })
    }

    // Cloudflare CDN 캐싱 설정
    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata.contentType || 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(object.body, { headers })
  },
}
```

### 4.3 R2 버킷 바인딩

1. Worker 설정에서 **Variables** 탭 선택
2. **R2 Bucket Bindings** 섹션에서 **Add binding** 클릭
3. Variable name: `R2_BUCKET`
4. Bucket: `kup-of-tea-images` 선택

### 4.4 커스텀 도메인 설정

1. Worker 설정에서 **Triggers** 탭 선택
2. **Custom Domains** 섹션에서 **Add Custom Domain** 클릭
3. 도메인 입력 (예: `images.k-tea.love`)
4. DNS 설정 후 활성화

## 5. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudflare R2 CDN
NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN=https://images.k-tea.love
# 또는 R2 퍼블릭 도메인 사용 시
# NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN=https://pub-xxxxx.r2.dev
```

## 6. 이미지 최적화 (선택사항)

Cloudflare Image Resizing을 사용하면 자동으로 이미지를 최적화할 수 있습니다.

### Workers에 Image Resizing 추가

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // 쿼리 파라미터에서 이미지 최적화 옵션 가져오기
    const width = url.searchParams.get('width')
    const height = url.searchParams.get('height')
    const quality = url.searchParams.get('quality') || '85'
    const format = url.searchParams.get('format') || 'webp'

    // R2에서 원본 이미지 가져오기
    const object = await env.R2_BUCKET.get(path)

    if (!object) {
      return new Response('Not Found', { status: 404 })
    }

    // Cloudflare Image Resizing 사용
    // 실제 구현은 Cloudflare Image Resizing API 문서 참고
    // 또는 @cloudflare/images 패키지 사용

    const headers = new Headers()
    headers.set('Content-Type', `image/${format}`)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(object.body, { headers })
  },
}
```

## 7. Vercel 배포 시 이미지 최적화

Vercel은 Next.js Image Optimization을 제공하지만, 무료 tier에는 제한이 있습니다. Cloudflare R2와 CDN을 사용하면:

- **Vercel 이미지 호출 제한 회피**: 이미지를 Cloudflare CDN에서 직접 제공
- **빠른 전송 속도**: Cloudflare의 글로벌 CDN 활용
- **비용 절감**: Vercel의 이미지 최적화 비용 없음
- **캐싱 효율성**: CDN 캐싱으로 서버 부하 감소

### Next.js Image 컴포넌트 사용 시

```tsx
import Image from 'next/image'
import { getR2ImageUrl } from '@/lib/cloudflare-r2'
;<Image
  src={getR2ImageUrl(imagePath, { width: 256, quality: 85, format: 'webp' })}
  alt="Profile"
  width={256}
  height={256}
  unoptimized // Cloudflare CDN이 최적화를 담당
/>
```

## 8. 무료 Tier 제한 확인

### Cloudflare R2

- **무료 tier**: 월 10GB 저장, 100만 건 읽기, 100만 건 쓰기
- 대부분의 소규모 프로젝트에는 충분합니다

### Cloudflare Workers

- **무료 tier**: 일 100,000 요청
- CDN 캐싱을 통해 실제 Worker 호출은 최소화됩니다

### Cloudflare CDN

- **무료 tier**: 무제한 대역폭
- 모든 HTTP/HTTPS 요청에 무료로 사용 가능

## 9. 모니터링

1. Cloudflare Dashboard > **Analytics**에서 트래픽 확인
2. R2 사용량 모니터링
3. Workers 호출 횟수 확인
4. CDN 캐시 적중률 확인

## 문제 해결

### 이미지가 로드되지 않음

- R2 버킷 퍼블릭 액세스 확인
- CORS 설정 확인
- CDN 도메인 DNS 설정 확인

### 느린 이미지 로딩

- CDN 캐싱 설정 확인
- 이미지 크기 최적화
- WebP 형식 사용

### 비용 초과

- R2 사용량 확인
- 불필요한 이미지 정리
- 이미지 압축 및 최적화
