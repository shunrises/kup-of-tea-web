# 그룹 타입 매핑 가이드

`group-form-creator`에서 선택한 그룹 타입을 데이터베이스의 `group_type` 필드로 매핑하는 방법입니다.

## 그룹 타입 값

데이터베이스에 저장되는 그룹 타입 값:

| 그룹 타입 | DB 값         | 설명               |
| --------- | ------------- | ------------------ |
| 보이 그룹 | `boy_group`   | 남성 그룹          |
| 걸 그룹   | `girl_group`  | 여성 그룹          |
| 혼성 그룹 | `coed_group`  | 남녀 혼성 그룹     |
| 남자 솔로 | `male_solo`   | 남성 솔로 아티스트 |
| 여자 솔로 | `female_solo` | 여성 솔로 아티스트 |

## group-form-creator에서 매핑

`group-form-creator`에서 사용하는 값과 데이터베이스 값의 매핑:

```typescript
// group-form-creator/lib/types.ts에서 정의된 값
type GroupType =
  | 'female_solo'
  | 'male_solo'
  | 'coed_group'
  | 'girl_group'
  | 'boy_group'

// 제출 시 그대로 전달하면 됨
const submitData = {
  groupType: groupType, // 'boy_group', 'girl_group', 'coed_group', 'male_solo', 'female_solo'
  // ...
}
```

## API에서의 사용

### 제출 API

```typescript
POST /api/submit-team
{
  "groupType": "boy_group" | "girl_group" | "coed_group" | "male_solo" | "female_solo",
  // ...
}
```

### 조회 API

`useGroups(type, gender)` 함수에서:

- `type='group'`, `gender='boy'` → `group_type='boy_group'`
- `type='group'`, `gender='girl'` → `group_type='girl_group'`
- `type='group'`, `gender='coed'` → `group_type='coed_group'`
- `type='solo'`, `gender='boy'` → `group_type='male_solo'`
- `type='solo'`, `gender='girl'` → `group_type='female_solo'`

## 데이터베이스 스키마

```sql
-- teams 테이블
group_type TEXT NOT NULL CHECK (group_type IN (
  'boy_group',
  'girl_group',
  'coed_group',
  'male_solo',
  'female_solo'
))

-- pending_teams 테이블 (동일)
group_type TEXT NOT NULL CHECK (group_type IN (
  'boy_group',
  'girl_group',
  'coed_group',
  'male_solo',
  'female_solo'
))
```

## 유효성 검사

`submit-team` API에서 자동으로 유효성 검사를 수행합니다:

```typescript
const validGroupTypes = [
  'boy_group',
  'girl_group',
  'coed_group',
  'male_solo',
  'female_solo',
]

if (!validGroupTypes.includes(groupType)) {
  return { error: 'Invalid groupType' }
}
```

## 예시

### 보이 그룹 제출

```json
{
  "name": "세븐틴",
  "ticker": "svt",
  "groupType": "boy_group",
  "logo": "https://...",
  "members": [...]
}
```

### 걸 그룹 제출

```json
{
  "name": "아이즈원",
  "ticker": "izone",
  "groupType": "girl_group",
  "logo": "https://...",
  "members": [...]
}
```

### 남자 솔로 제출

```json
{
  "name": "태연",
  "ticker": "taeyeon",
  "groupType": "male_solo", // 실제로는 female_solo가 맞음
  "logo": "https://...",
  "members": [...]
}
```
