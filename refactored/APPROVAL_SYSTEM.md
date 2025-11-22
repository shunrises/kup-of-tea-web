# 승인 시스템 개요

이 프로젝트는 사용자 제출 → 관리자 승인 → 메인 서비스 표시 워크플로우를 구현합니다.

## 전체 흐름

```
1. 사용자 제출 (group-form-creator)
   ↓
2. pending_teams, pending_artist_members 테이블에 저장 (status: 'pending')
   ↓
3. 관리자가 승인 페이지에서 확인
   ↓
4. 승인/거부 결정
   ├─ 승인: approve_team() 함수 실행
   │   └─ teams, artist_members 테이블로 이동
   └─ 거부: reject_team() 함수 실행
       └─ status만 'rejected'로 변경
   ↓
5. 메인 서비스는 teams, artist_members에서만 조회 (승인된 데이터만 표시)
```

## 주요 파일

### 데이터베이스 스키마

- `SUPABASE_SETUP.md` - 테이블 생성 및 RLS 정책 설정

### 서비스 로직

- `src/services/approval.ts` - 승인 관련 함수들
  - `getPendingTeams()` - 승인 대기 목록 조회
  - `approveTeam()` - 팀 승인
  - `rejectTeam()` - 팀 거부

### API Routes

- `src/app/api/submit-team/route.ts` - 팀 제출 API
- `src/app/api/admin/approve-team/route.ts` - 팀 승인 API
- `src/app/api/admin/reject-team/route.ts` - 팀 거부 API

### 관리자 페이지

- `src/app/admin/approval/[secret]/page.tsx` - 승인 관리 페이지

## 보안

### 접근 제어

1. **제출**: 누구나 가능 (퍼블릭)
2. **승인/거부**: 관리자만 가능
   - 시크릿 키 기반: `/admin/approval/{SECRET_KEY}`
   - API 호출 시 `Authorization: Bearer {SECRET_KEY}` 헤더 필요

### RLS 정책

- `teams`, `artist_members`: 퍼블릭 읽기
- `pending_teams`: 퍼블릭 쓰기, 제한된 읽기
- 함수 실행: `service_role` 키로만 가능 (서버 사이드)

## 사용 방법

### 1. 제출

```typescript
// group-form-creator에서
const response = await fetch('/api/submit-team', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '세븐틴',
    ticker: 'svt',
    logo: 'https://images.k-tea.love/logos/svt.png',
    members: [{ name: '정한', profileImage: 'https://...' }],
  }),
})
```

### 2. 승인

1. 관리자 승인 페이지 접근: `https://domain.com/admin/approval/{SECRET_KEY}`
2. 승인 대기 목록 확인
3. 승인 또는 거부 버튼 클릭

### 3. 결과 확인

- 승인된 데이터는 `teams`, `artist_members` 테이블에 나타남
- 메인 서비스에서 바로 조회 가능

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # 서버 사이드 전용

# 승인 시스템
ADMIN_APPROVAL_SECRET_KEY=...  # 관리자 페이지 접근용
```

## 다음 단계

1. Supabase 데이터베이스 설정: `SUPABASE_SETUP.md` 참고
2. group-form-creator 연동: `GROUP_FORM_INTEGRATION.md` 참고
3. 테스트: 로컬 환경에서 제출 → 승인 → 표시 플로우 테스트
