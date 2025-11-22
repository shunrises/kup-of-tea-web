# Recoil에서 React Context로 마이그레이션

이 프로젝트는 Recoil 상태 관리 라이브러리 대신 React의 내장 Context API를 사용하도록 리팩토링되었습니다.

## 변경 사항

### 제거된 것
- `recoil` 패키지 제거
- `src/states/` 디렉토리의 Recoil atom/selector 파일들

### 추가된 것
- `src/stores/` 디렉토리에 React Context 기반 스토어들:
  - `userStore.tsx` - 사용자 정보 관리
  - `answerStore.tsx` - 답변 정보 관리
  - `selectStore.tsx` - 선택 정보 관리 (성별, 타입)
  - `modalStore.tsx` - 모달 상태 관리

## 사용 방법

### 이전 (Recoil)
```tsx
import { useRecoilState } from 'recoil'
import { userState } from '@/states/user'

const [user, setUser] = useRecoilState(userState(`u${index}`))
```

### 현재 (React Context)
```tsx
import { useUserStore } from '@/stores/userStore'

const { getUser, updateUser } = useUserStore()
const user = getUser(`u${index}`)
// 또는
updateUser(`u${index}`, { username: '새 이름' })
```

## 스토어 API

### UserStore
- `users: User[]` - 모든 사용자 배열
- `getUser(id: string)` - 특정 사용자 가져오기
- `updateUser(id: string, updates: Partial<User>)` - 사용자 정보 업데이트
- `resetUsers()` - 모든 사용자 초기화

### AnswerStore
- `getAnswer(id: string)` - 특정 답변 가져오기
- `updateAnswer(id: string, artistMember)` - 답변 업데이트
- `getAllAnswers()` - 모든 다인용 답변 가져오기
- `getAllSingleAnswers()` - 모든 단인용 답변 가져오기
- `resetAnswers()` - 모든 답변 초기화

### SelectStore
- `selection: SelectState` - 현재 선택 정보
- `setSelection(updates: Partial<SelectState>)` - 선택 정보 업데이트
- `resetSelection()` - 선택 정보 초기화

### ModalStore
- `modal: ModalState` - 현재 모달 상태
- `setModal(updates: Partial<ModalState>)` - 모달 상태 업데이트
- `resetModal()` - 모달 상태 초기화

## 장점

1. **외부 의존성 제거**: Recoil 패키지 없이 React 기본 기능만 사용
2. **더 명확한 API**: 각 스토어의 인터페이스가 명확함
3. **타입 안정성**: TypeScript로 모든 스토어가 타입 안전하게 정의됨
4. **더 작은 번들 크기**: 추가 상태 관리 라이브러리 없이 번들 크기 감소

