# group-form-creator 연동 가이드

`group-form-creator`를 사용하여 사용자가 팀/멤버 정보를 제출하고, 관리자가 승인하는 프로세스를 설정하는 방법입니다.

## 1. group-form-creator 수정

### 1.1 제출 API 변경

`group-form-creator/app/page.tsx` 또는 `group-form-creator/app/api/music-groups/route.ts`에서 제출 로직을 수정합니다.

```typescript
// 기존 (Rails 백엔드)
const response = await fetch(
  'https://your-rails-backend.com/api/music_groups',
  {
    method: 'POST',
    // ...
  },
)

// 변경 후 (refactored 프로젝트 API)
const response = await fetch('/api/submit-team', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: groupName,
    ticker: generateTicker(groupName), // ticker 생성 로직 필요
    logo: logoImage, // Cloudflare R2 URL 또는 base64
    groupPhoto: groupPhoto || '',
    groupType: groupType, // 'boy_group' | 'girl_group' | 'coed_group' | 'male_solo' | 'female_solo'
    members: members.map((member) => ({
      name: member.name,
      profileImage: member.profileImage, // Cloudflare R2 URL 또는 base64
    })),
    submittedBy: 'user@example.com', // 선택사항
  }),
})
```

### 1.2 ticker 생성

ticker는 고유해야 하므로, 그룹 이름에서 자동 생성하거나 사용자가 입력하도록 해야 합니다.

```typescript
// 예시: ticker 생성 함수
function generateTicker(name: string): string {
  // 영어로 변환 (한글 -> 로마자 변환 라이브러리 사용 가능)
  // 또는 간단히 소문자 변환
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
```

### 1.3 이미지 업로드

이미지를 Cloudflare R2에 업로드한 후 URL을 제출하도록 해야 합니다.

```typescript
// Cloudflare R2에 이미지 업로드 (서버 사이드)
// 또는 직접 base64로 전송하여 API에서 처리

// 방법 1: 클라이언트에서 R2에 직접 업로드 (권장)
async function uploadToR2(file: File, path: string): Promise<string> {
  // R2 업로드 로직 (R2 API 사용)
  // ...
  return r2Url
}

// 방법 2: API를 통해 업로드
async function uploadViaAPI(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  return data.url
}
```

## 2. 승인 프로세스

### 2.1 관리자 승인 페이지 접근

관리자는 특정 URL에서만 승인 페이지에 접근할 수 있습니다:

```
https://your-domain.com/admin/approval/{SECRET_KEY}
```

`SECRET_KEY`는 `.env.local`의 `ADMIN_APPROVAL_SECRET_KEY` 값과 일치해야 합니다.

### 2.2 승인 프로세스

1. **제출**: 사용자가 `group-form-creator`를 통해 팀 정보 제출
   - `pending_teams`, `pending_artist_members` 테이블에 저장
   - 상태: `pending`

2. **승인 대기**: 관리자가 승인 페이지에서 대기 중인 항목 확인

3. **승인/거부**: 관리자가 결정
   - **승인**: `approve_team()` 함수 실행
     - `pending_teams` → `teams` 테이블로 이동
     - `pending_artist_members` → `artist_members` 테이블로 이동
     - 상태: `approved`
   - **거부**: `reject_team()` 함수 실행
     - 상태만 `rejected`로 변경
     - 거부 사유 저장

4. **표시**: 메인 서비스는 `teams`, `artist_members` 테이블에서만 조회
   - 승인된 데이터만 표시됨

## 3. API 엔드포인트

### 3.1 팀 제출

```
POST /api/submit-team
Content-Type: application/json

{
  "name": "세븐틴",
  "ticker": "svt",
  "logo": "https://images.k-tea.love/logos/svt.png",
  "groupPhoto": "https://images.k-tea.love/photos/svt.jpg",
  "members": [
    {
      "name": "정한",
      "profileImage": "https://images.k-tea.love/members/svt/jeonghan.jpg"
    }
  ],
  "submittedBy": "user@example.com" // 선택사항
}
```

**응답:**

```json
{
  "success": true,
  "pendingTeamId": 123,
  "message": "Team submitted for approval"
}
```

### 3.2 팀 승인

```
POST /api/admin/approve-team
Authorization: Bearer {ADMIN_APPROVAL_SECRET_KEY}
Content-Type: application/json

{
  "pendingTeamId": 123,
  "reviewerName": "admin" // 선택사항
}
```

### 3.3 팀 거부

```
POST /api/admin/reject-team
Authorization: Bearer {ADMIN_APPROVAL_SECRET_KEY}
Content-Type: application/json

{
  "pendingTeamId": 123,
  "rejectionReason": "이미 존재하는 팀입니다",
  "reviewerName": "admin" // 선택사항
}
```

## 4. 환경 변수 설정

### refactored 프로젝트

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_APPROVAL_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN=https://images.k-tea.love
```

### group-form-creator (선택사항)

`group-form-creator`가 별도 프로젝트라면:

```env
NEXT_PUBLIC_SUBMIT_API_URL=https://your-refactored-domain.com/api/submit-team
```

## 5. 배포 시 고려사항

### 5.1 CORS 설정

`group-form-creator`가 별도 도메인에서 호스팅되는 경우, CORS 설정이 필요합니다:

```typescript
// refactored/src/app/api/submit-team/route.ts
export async function POST(request: NextRequest) {
  // CORS 헤더 추가
  const origin = request.headers.get('origin')

  // 허용된 도메인 확인
  const allowedOrigins = [
    'https://group-form-creator.com',
    'http://localhost:3001', // 개발 환경
  ]

  const headers = new Headers()
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers })
  }

  // ... 나머지 로직
}
```

### 5.2 이미지 업로드

이미지는 Cloudflare R2에 업로드되어야 합니다. 두 가지 방법:

1. **직접 R2 업로드** (권장)
   - `group-form-creator`에서 직접 R2에 업로드
   - 업로드된 URL을 제출

2. **API를 통한 업로드**
   - `refactored` 프로젝트에 이미지 업로드 API 추가
   - `group-form-creator`에서 API 호출

## 6. 테스트

### 6.1 로컬 테스트

```bash
# refactored 프로젝트
cd refactored
pnpm dev
# http://localhost:3000

# group-form-creator 프로젝트
cd group-form-creator
pnpm dev
# http://localhost:3001
```

### 6.2 제출 테스트

1. `group-form-creator`에서 팀 정보 제출
2. Supabase `pending_teams` 테이블에서 확인
3. 관리자 승인 페이지에서 승인
4. `teams`, `artist_members` 테이블에서 확인
5. 메인 서비스에서 승인된 팀 표시 확인

## 문제 해결

### 제출 실패

- API URL 확인
- CORS 설정 확인
- Supabase RLS 정책 확인
- ticker 중복 확인

### 승인 실패

- service_role 키 확인
- Supabase 함수 권한 확인
- 로그 확인

### 이미지 로드 실패

- Cloudflare R2 URL 확인
- CDN 설정 확인
- CORS 설정 확인
