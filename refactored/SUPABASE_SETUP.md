# Supabase 설정 가이드 (승인 시스템 포함)

이 프로젝트는 Supabase를 백엔드로 사용하며, 사용자가 제출한 그룹/멤버 정보를 관리자가 승인하는 시스템을 포함합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `kup-of-tea` (원하는 이름)
   - **Database Password**: 강한 비밀번호 설정
   - **Region**: 가장 가까운 리전 선택 (예: Northeast Asia (Seoul))
4. **Create new project** 클릭

## 2. 데이터베이스 스키마 설정

### 2.1 teams 테이블 생성

SQL Editor에서 다음 SQL 실행:

```sql
-- teams 테이블 생성
CREATE TABLE IF NOT EXISTS public.teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL,
  group_photo TEXT NOT NULL DEFAULT '',
  group_type TEXT NOT NULL CHECK (group_type IN ('boy_group', 'girl_group', 'coed_group', 'male_solo', 'female_solo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS teams_ticker_idx ON public.teams(ticker);
CREATE INDEX IF NOT EXISTS teams_name_idx ON public.teams(name);
CREATE INDEX IF NOT EXISTS teams_group_type_idx ON public.teams(group_type);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 읽기 정책 (모든 사용자가 읽을 수 있음)
CREATE POLICY "Allow public read access" ON public.teams
  FOR SELECT
  USING (true);
```

### 2.2 artist_members 테이블 생성

```sql
-- artist_members 테이블 생성
CREATE TABLE IF NOT EXISTS public.artist_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS artist_members_team_id_idx ON public.artist_members(team_id);
CREATE INDEX IF NOT EXISTS artist_members_name_idx ON public.artist_members(name);

-- RLS 활성화
ALTER TABLE public.artist_members ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 읽기 정책
CREATE POLICY "Allow public read access" ON public.artist_members
  FOR SELECT
  USING (true);
```

### 2.3 pending_teams 테이블 생성 (승인 대기)

```sql
-- pending_teams 테이블 생성 (승인 대기 중인 팀 제출물)
CREATE TABLE IF NOT EXISTS public.pending_teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  logo TEXT NOT NULL,
  group_photo TEXT NOT NULL DEFAULT '',
  group_type TEXT NOT NULL CHECK (group_type IN ('boy_group', 'girl_group', 'coed_group', 'male_solo', 'female_solo')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT, -- 제출자 정보 (선택사항)
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT, -- 승인/거부한 관리자
  rejection_reason TEXT, -- 거부 사유 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS pending_teams_status_idx ON public.pending_teams(status);
CREATE INDEX IF NOT EXISTS pending_teams_submitted_at_idx ON public.pending_teams(submitted_at);

-- RLS 활성화
ALTER TABLE public.pending_teams ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 쓰기 정책 (누구나 제출 가능)
CREATE POLICY "Allow public insert" ON public.pending_teams
  FOR INSERT
  WITH CHECK (true);

-- 퍼블릭 읽기 정책 (자신이 제출한 것만 읽기 가능 - 선택사항)
-- 또는 관리자만 읽기 가능하도록 설정
CREATE POLICY "Allow public read pending" ON public.pending_teams
  FOR SELECT
  USING (status = 'pending');
```

### 2.4 pending_artist_members 테이블 생성 (승인 대기)

```sql
-- pending_artist_members 테이블 생성 (승인 대기 중인 멤버 제출물)
CREATE TABLE IF NOT EXISTS public.pending_artist_members (
  id BIGSERIAL PRIMARY KEY,
  pending_team_id BIGINT NOT NULL REFERENCES public.pending_teams(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES public.teams(id) ON DELETE CASCADE, -- 승인 후 실제 team_id로 업데이트
  name TEXT NOT NULL,
  profile_image TEXT,
  member_order INTEGER DEFAULT 0, -- 멤버 순서
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS pending_artist_members_pending_team_id_idx ON public.pending_artist_members(pending_team_id);
CREATE INDEX IF NOT EXISTS pending_artist_members_team_id_idx ON public.pending_artist_members(team_id);

-- RLS 활성화
ALTER TABLE public.pending_artist_members ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 쓰기 정책
CREATE POLICY "Allow public insert" ON public.pending_artist_members
  FOR INSERT
  WITH CHECK (true);

-- 퍼블릭 읽기 정책
CREATE POLICY "Allow public read pending" ON public.pending_artist_members
  FOR SELECT
  USING (true);
```

### 2.5 승인 프로세스를 위한 함수 생성

```sql
-- 팀 승인 함수 (pending_teams를 teams로 승인)
CREATE OR REPLACE FUNCTION approve_team(pending_id BIGINT, reviewer_name TEXT DEFAULT NULL)
RETURNS BIGINT AS $$
DECLARE
  new_team_id BIGINT;
  pending_team RECORD;
BEGIN
  -- pending_teams에서 데이터 가져오기
  SELECT * INTO pending_team
  FROM public.pending_teams
  WHERE id = pending_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending team not found or already processed';
  END IF;

  -- teams 테이블에 삽입
  INSERT INTO public.teams (name, ticker, logo, group_photo, group_type)
  VALUES (pending_team.name, pending_team.ticker, pending_team.logo, pending_team.group_photo, pending_team.group_type)
  RETURNING id INTO new_team_id;

  -- pending_artist_members의 team_id 업데이트
  UPDATE public.pending_artist_members
  SET team_id = new_team_id
  WHERE pending_team_id = pending_id;

  -- artist_members 테이블에 삽입
  INSERT INTO public.artist_members (team_id, name, profile_image)
  SELECT team_id, name, profile_image
  FROM public.pending_artist_members
  WHERE pending_team_id = pending_id AND team_id IS NOT NULL;

  -- pending_teams 상태 업데이트
  UPDATE public.pending_teams
  SET status = 'approved',
      reviewed_at = timezone('utc'::text, now()),
      reviewed_by = reviewer_name,
      updated_at = timezone('utc'::text, now())
  WHERE id = pending_id;

  RETURN new_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 팀 거부 함수
CREATE OR REPLACE FUNCTION reject_team(pending_id BIGINT, rejection_reason TEXT, reviewer_name TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.pending_teams
  SET status = 'rejected',
      reviewed_at = timezone('utc'::text, now()),
      reviewed_by = reviewer_name,
      rejection_reason = rejection_reason,
      updated_at = timezone('utc'::text, now())
  WHERE id = pending_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending team not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 실행 권한 부여 (service_role 키로만 실행 가능하도록)
-- 실제로는 서버 사이드에서만 호출하므로 anon key로는 실행 불가
```

### 2.6 updated_at 자동 업데이트 트리거

```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 추가
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_members_updated_at
  BEFORE UPDATE ON public.artist_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_teams_updated_at
  BEFORE UPDATE ON public.pending_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 3. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # 서버 사이드에서만 사용

# Cloudflare R2 CDN (이미지 제공)
NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN=https://images.k-tea.love

# 관리자 인증 (Supabase Auth)
ADMIN_EMAILS=admin@example.com,admin2@example.com  # 관리자 이메일 목록 (쉼표로 구분)
# 빈 값이면 모든 인증된 사용자가 관리자로 간주됨
```

### Supabase 키 확인 방법

1. Supabase Dashboard > 프로젝트 선택
2. **Settings** > **API** 메뉴
3. 다음 정보 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (클라이언트에서 사용)
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY` (서버 사이드에서만 사용, **절대 클라이언트에 노출 금지**)

## 4. 승인 프로세스 흐름

1. **제출**: 사용자가 `group-form-creator`를 통해 팀/멤버 정보 제출
   - 데이터는 `pending_teams`, `pending_artist_members`에 저장
   - 상태는 `pending`으로 설정

2. **승인 대기**: 관리자 페이지에서 `status = 'pending'`인 항목 확인

3. **승인/거부**: 관리자가 승인 또는 거부 결정
   - **승인**: `approve_team()` 함수 실행 → `teams`, `artist_members` 테이블에 데이터 이동
   - **거부**: `reject_team()` 함수 실행 → 상태만 `rejected`로 변경

4. **표시**: 메인 서비스는 `teams`, `artist_members` 테이블에서만 데이터 조회 (승인된 데이터만 표시)

## 5. 보안 고려사항

### RLS (Row Level Security)

- `teams`, `artist_members`: 누구나 읽기 가능 (퍼블릭 데이터)
- `pending_teams`: 제출은 누구나 가능, 읽기는 제한 (또는 관리자만)
- 함수 실행: `service_role` 키로만 실행 가능 (서버 사이드)

### 관리자 승인 페이지 접근

Supabase Auth를 통한 관리자 인증을 사용합니다:

1. **관리자 계정 생성**
   - Supabase Dashboard > **Authentication** > **Users** 메뉴
   - **Add user** 클릭하여 관리자 계정 생성
   - 또는 사용자가 `/admin/login` 페이지에서 직접 회원가입 후, 관리자로 승인

2. **관리자 이메일 설정**
   - `.env.local` 파일에 `ADMIN_EMAILS` 환경 변수 설정
   - 쉼표로 구분된 이메일 목록: `admin@example.com,admin2@example.com`
   - 빈 값이면 모든 인증된 사용자가 관리자로 간주됨

3. **접근 방법**
   - `/admin/login`: 관리자 로그인 페이지
   - `/admin/approval`: 승인 관리 페이지 (로그인 필요)
   - 관리자가 아닌 경우 자동으로 로그인 페이지로 리다이렉트

## 6. Supabase Auth 설정 (관리자 인증)

### 6.1 이메일/비밀번호 인증 활성화

1. Supabase Dashboard > **Authentication** > **Providers** 메뉴
2. **Email** 프로바이더 활성화
3. 필요 시 이메일 확인 설정 조정

### 6.2 관리자 계정 생성

**방법 1: Supabase Dashboard에서 직접 생성**

1. Supabase Dashboard > **Authentication** > **Users** 메뉴
2. **Add user** 클릭
3. 이메일과 비밀번호 입력
4. 사용자 생성

**방법 2: 사용자가 직접 회원가입**

1. `/admin/login` 페이지로 이동
2. 회원가입 후 관리자 이메일 목록에 추가

### 6.3 관리자 이메일 설정

`.env.local` 파일에 관리자 이메일 설정:

```env
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

- 쉼표로 구분된 이메일 목록
- 빈 값이면 모든 인증된 사용자가 관리자로 간주됨

### 6.4 관리자 페이지 접근

1. **로그인**: `/admin/login`
2. **승인 페이지**: `/admin/approval` (로그인 필요)
3. 관리자가 아닌 경우 자동으로 로그인 페이지로 리다이렉트

## 다음 단계

1. ✅ 승인 시스템 로직 구현: `src/services/approval.ts`
2. ✅ 관리자 승인 페이지: `src/app/admin/approval/page.tsx`
3. ✅ group-form-creator 연동: 제출 로직을 Supabase로 변경
4. ✅ 메인 서비스 필터링: 승인된 데이터만 조회하도록 수정
5. Supabase Auth 설정 및 관리자 계정 생성
