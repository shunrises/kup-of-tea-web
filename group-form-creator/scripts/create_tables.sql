-- 음악 그룹 메인 테이블
CREATE TABLE music_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_type VARCHAR(50) NOT NULL CHECK (group_type IN ('female_solo', 'male_solo', 'coed_group', 'girl_group', 'boy_group')),
  logo_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 멤버 정보 테이블
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  music_group_id UUID NOT NULL REFERENCES music_groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  member_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 같은 그룹 내에서 멤버 순서는 유니크해야 함
  UNIQUE(music_group_id, member_order)
);

-- 인덱스 생성
CREATE INDEX idx_members_music_group_id ON members(music_group_id);
CREATE INDEX idx_members_order ON members(music_group_id, member_order);

-- RLS (Row Level Security) 정책 설정 (필요한 경우)
ALTER TABLE music_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 예시: 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Allow public read access" ON music_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON members FOR SELECT USING (true);

-- 예시: 인증된 사용자만 생성/수정 가능하도록 설정
CREATE POLICY "Allow authenticated insert" ON music_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
