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
- `app/(tabs)/` - Main tab navigation (home, explore, settings)
- `app/auth/` - Authentication flow (social-signup → category → level)
- `app/livekit.tsx` - LiveKit voice call screen
- `app/modal.tsx` - Modal presentation

### State Management
- TanStack Query (`@tanstack/react-query`) for server state
- React hooks for local state
- `utils/token.ts` - Secure token storage (expo-secure-store on native, localStorage on web)

### API Layer
- `utils/api-client.ts` - Axios instance with automatic token refresh on 401
- `apis/` - API modules with React Query hooks (auth, members, notification-schedules)
- Base URL from `EXPO_PUBLIC_API_URL` environment variable

### Enums
- `constants/enums.ts` - Centralized enum definitions
- Pattern: `const X = {...} as const` + `type X = (typeof X)[keyof typeof X]`
- Available enums: `Category`, `Level`, `DayOfWeek`

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
