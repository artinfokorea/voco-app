# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voco is an Expo/React Native voice communication app integrating LiveKit for real-time audio/video calls with AI agents. It supports social authentication (Google, Apple, Kakao) and runs on iOS, Android, and web.

## Development Commands

```bash
# Start Expo dev server
npm start

# Run on specific platforms
npm run ios          # iOS simulator/device
npm run android      # Android emulator/device
npm run web          # Web browser

# Linting
npm run lint
```

## Architecture

### Routing (expo-router)
- `app/_layout.tsx` - Root layout with QueryClient and ThemeProvider
- `app/(tabs)/` - Main tab navigation (home, calls, schedules, settings)
- `app/auth/` - Authentication flow (social-signup → category → level)
- `app/livekit.tsx` - LiveKit voice call screen
- `app/modal.tsx` - Modal presentation

### State Management
- TanStack Query (`@tanstack/react-query`) for server state
- React hooks for local state
- `utils/token.ts` - Secure token storage (expo-secure-store on native, localStorage on web)

### API Layer
- `utils/api-client.ts` - Axios instance with automatic token refresh on 401
- `apis/` - API modules with React Query hooks (auth, calls, members, notification-schedules, scenarios)
- Base URL from `EXPO_PUBLIC_API_URL` environment variable

### API Types (공통 응답 타입)
- `types/api.ts` - 모든 API 응답의 공통 타입 정의
- **기본 타입**:
  - `ApiResponse<T>` - 기본 API 응답 래퍼
  - `PagedResponse<T>` - Spring Data JPA Page 구조 응답
  - `SimplePagedResponse<T>` - 간소화된 페이지네이션 응답
  - `ApiException` - 에러 정보 타입
  - `ServerError` - 클라이언트 에러 타입
- **헬퍼 함수**:
  - `createServerError()` - API 에러를 Error 객체로 변환
- 사용 예시:
  ```typescript
  import { ApiResponse, PagedResponse, createServerError } from '@/types/api';

  // 단일 아이템 응답
  type UserResponse = ApiResponse<User>;

  // 페이지네이션 응답
  type UsersResponse = PagedResponse<User>;

  // API 함수에서 에러 처리
  const serverData = response.data;
  if (serverData.type === 'FAIL') {
    throw createServerError(serverData);
  }
  ```

### Hooks (도메인별 로직 분리)
도메인/기능별로 디렉토리를 구분하여 비즈니스 로직을 UI에서 분리

```
hooks/
├── calls/
│   └── use-infinite-calls.ts    # 통화 목록 무한 스크롤 조회
├── notification-schedule/
│   └── use-notification-schedule-form.ts  # 스케줄 폼 상태 및 CRUD
├── scenario/
│   └── use-scenario-selection.ts  # 시나리오 선택 상태 관리
├── use-livekit.ts               # LiveKit 룸 연결 및 메시징
├── use-social-signup.tsx        # 소셜 회원가입 플로우 (Context)
├── use-color-scheme.ts          # 테마 컬러 스킴
└── use-theme-color.ts           # 테마 컬러 해석
```

#### Hook 사용 예시
```typescript
// 통화 목록 조회
const { calls, isLoading, onRefresh, onEndReached } = useInfiniteCalls();

// 스케줄 폼 관리
const { openCreateModal, handleSave, handleDelete } = useNotificationScheduleForm();

// 시나리오 선택
const { selectedLevel, scenarios, handleScenarioSelect } = useScenarioSelection();
```

### Utils (유틸리티 함수)
순수 함수들을 도메인별로 분리

```
utils/
├── format/
│   └── date.ts          # formatRelativeDate() - 상대 시간 포맷팅
├── score.ts             # getScoreColor(), getScoreLabel() - 점수 색상/라벨
├── api-client.ts        # Axios 인스턴스
├── token.ts             # 토큰 저장소
├── auth/                # 소셜 인증 구현
└── livekit/             # LiveKit 토큰 관리
```

### Enums
- `constants/enums.ts` - Centralized enum definitions
- Pattern: `const X = {...} as const` + `type XType = (typeof X)[keyof typeof X]`
- **const** (값 접근): `Category`, `Level`, `DayOfWeek`, `Grade`
- **type** (타입 어노테이션): `CategoryType`, `LevelType`, `DayOfWeekType`, `GradeType`
- **labels** (UI 표시용): `DayOfWeekLabels`
- **colors** (UI 색상): `GradeColors`
- 사용 예시:
  ```typescript
  // 값 접근
  Category.DAILY, Level.BEGINNER, DayOfWeek.MONDAY

  // 타입 어노테이션
  const level: LevelType = Level.BEGINNER;
  const categories: CategoryType[] = [Category.DAILY];

  // 라벨 표시
  DayOfWeekLabels[DayOfWeek.MONDAY] // '월요일'
  GradeColors[Grade.EXCELLENT] // '#55efc4'
  ```

### LiveKit Integration
- `hooks/use-livekit.ts` - Central hook managing room connection, audio, participants, and transcription
- `components/livekit/` - UI components (call-view, chat-view, connection-form, room-header)
- `utils/livekit/token.ts` - Token fetching via `POST /livekit/token` API (requires authentication)
- `constants/livekit.ts` - Configuration (serverUrl, defaultRoom)

### Authentication
- `utils/auth/google.ts`, `apple.ts`, `kakao.ts` - Social auth implementations
- `components/auth/` - Auth UI components (SocialButton, InputField)

### Theming
- `constants/colors.ts` - Color palette with light/dark variants
- `constants/theme.ts` - Theme constants
- `hooks/use-color-scheme.ts` - Platform-aware color scheme hook

## Code Organization Patterns

### UI와 로직 분리 원칙
1. **Screen 컴포넌트**: UI 렌더링과 이벤트 핸들링만 담당
2. **Custom Hooks**: 비즈니스 로직, 상태 관리, API 호출 캡슐화
3. **Utils**: 순수 함수로 재사용 가능한 로직 분리

### Hook 작성 가이드
- 함수 상단에 JSDoc 주석으로 역할 설명
- 관련 상태와 액션을 하나의 훅으로 묶기
- `useCallback`/`useMemo`로 불필요한 리렌더링 방지

## Key Configuration

### Environment Variables
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_LIVEKIT_URL` - LiveKit WebSocket server URL
- `EXPO_PUBLIC_LIVEKIT_ROOM` - Default room name
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` - Google OAuth iOS client ID

### Path Aliases
`@/*` maps to project root (configured in tsconfig.json)

## Native Configuration

- iOS requires `GoogleService-Info.plist` for Google Sign-In
- CodePush configured via `plugins/withCodePush.js`
- Required permissions: Camera, Microphone, Audio background mode
