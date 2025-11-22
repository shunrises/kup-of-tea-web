# 프로젝트 통합 완료

`group-form-creator` 프로젝트를 `refactored` 프로젝트에 통합했습니다.

## 통합된 내용

### 1. 페이지

- `/submit`: 그룹/멤버 정보 제출 페이지
  - 기존: `group-form-creator/app/page.tsx`
  - 통합 후: `refactored/src/app/submit/page.tsx`

### 2. 컴포넌트

- `src/components/ui/`: 모든 UI 컴포넌트 (shadcn/ui)
  - Button, Card, Input, Label, RadioGroup 등
  - DnD 관련 컴포넌트는 dnd-kit 사용

### 3. 의존성

다음 패키지들이 `package.json`에 추가되었습니다:

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `framer-motion`
- `lucide-react`
- `react-hot-toast`
- `tailwind-merge`, `tailwindcss-animate`
- `class-variance-authority`

### 4. 유틸리티

- `src/utils/generateTicker.ts`: 그룹 이름에서 ticker 생성
- `src/lib/utils.ts`: `cn()` 함수 (Tailwind 클래스 병합)

### 5. API 통합

- 제출 로직이 `/api/submit-team`으로 변경됨
- 기존 Rails 백엔드 호출 제거
- Supabase 기반 승인 시스템과 연동

## 제출 프로세스

1. **사용자 제출**: `/submit` 페이지에서 팀 정보 입력
2. **API 호출**: `/api/submit-team`으로 데이터 전송
3. **승인 대기**: `pending_teams`, `pending_artist_members` 테이블에 저장
4. **관리자 승인**: `/admin/approval/[secret]` 페이지에서 승인
5. **서비스 표시**: 승인된 데이터가 메인 서비스에 표시

## 다음 단계

### 1. 의존성 설치

```bash
cd refactored
pnpm install
```

### 2. 이미지 업로드 설정

이미지를 Cloudflare R2에 업로드하는 로직이 필요합니다. 현재는 base64로 전송하거나, 이미 R2 URL이 있다고 가정합니다.

이미지 업로드를 위한 API 추가 고려:

- `/api/upload-image`: R2에 이미지 업로드 후 URL 반환

### 3. ticker 생성 개선

`generateTicker()` 함수가 한글 이름을 ticker로 변환합니다. 더 정확한 변환을 위해서는:

- 한글 → 로마자 변환 라이브러리 사용 (예: `romanize`)
- 또는 매핑 테이블 확장

### 4. 메인 페이지에서 제출 링크 추가

메인 페이지(`/`)에서 `/submit`으로 연결하는 링크/버튼 추가

## 파일 구조

```
refactored/
├── src/
│   ├── app/
│   │   ├── submit/              # 통합된 제출 페이지
│   │   │   └── page.tsx
│   │   ├── admin/               # 관리자 승인 페이지
│   │   │   └── approval/[secret]/
│   │   └── api/
│   │       └── submit-team/     # 제출 API
│   ├── components/
│   │   └── ui/                  # 통합된 UI 컴포넌트
│   ├── hooks/
│   │   └── use-toast.ts         # Toast 훅
│   ├── lib/
│   │   └── utils.ts             # 유틸리티 함수
│   └── utils/
│       └── generateTicker.ts    # Ticker 생성
```

## 참고사항

- `group-form-creator` 프로젝트는 더 이상 필요하지 않습니다 (통합 완료)
- 모든 기능이 `refactored` 프로젝트에 통합되었습니다
- 환경 변수는 `refactored/.env.local`에 설정하면 됩니다
