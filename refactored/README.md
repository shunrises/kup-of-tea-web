# K-POP 아이돌 취향표 생성기 (Refactored)

이 프로젝트는 기존 `kup-of-tea-web` 프로젝트를 리팩토링한 버전입니다.

## 주요 개선사항

- **깨끗한 코드 구조**: 핵심 비즈니스 로직과 UI를 분리
- **타입 안정성**: TypeScript와 Zod를 활용한 타입 검증
- **Figma MCP 서버 지원**: UI 디자인을 Figma에서 직접 가져올 수 있습니다
- **최신 Next.js**: Next.js 16과 React 19 사용

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지 및 레이아웃
├── components/       # 재사용 가능한 UI 컴포넌트
├── constants/        # 상수 정의
├── services/         # API 호출 로직
├── stores/           # React Context 상태 관리
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
└── shared/           # 공유 함수 및 설정
```

## 핵심 기능

- **그룹 및 멤버 데이터 관리**: Supabase를 통한 데이터 페칭
- **취향표 생성**: 다인용/단인용 취향표 생성
- **이미지 다운로드**: html2canvas를 활용한 이미지 생성
- **상태 관리**: React Context API를 활용한 전역 상태 관리 (외부 라이브러리 없이)

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
bun install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 참고하여 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
cp .env.local.example .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## Figma MCP 서버 연동

이 프로젝트는 Figma MCP 서버를 통해 UI 디자인을 가져올 수 있도록 구성되어 있습니다.

### 설정 방법

1. Figma MCP 서버가 설정되어 있는지 확인하세요
2. `.env.local` 파일에 Figma 관련 환경 변수를 추가하세요:

```env
FIGMA_FILE_KEY=your-figma-file-key
FIGMA_NODE_ID=your-node-id
```

3. Figma에서 디자인을 가져오려면 MCP 도구를 사용하세요

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React Context API (외부 라이브러리 없이)
- **데이터 페칭**: SWR
- **검증**: Zod
- **UI 라이브러리**: @toss/use-overlay

## 라이선스

이 프로젝트는 기존 `kup-of-tea-web` 프로젝트의 리팩토링 버전입니다.
