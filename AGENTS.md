# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Expo Router screens and layouts (e.g. `app/(tabs)/`, `app/auth/`, `app/_layout.tsx`).
- `components/`: Reusable UI components (`components/auth/`, `components/livekit/`, `components/ui/`).
- `hooks/`: Shared hooks (notably LiveKit + theme hooks).
- `apis/`: API wrappers (e.g. `apis/auth.ts`).
- `utils/`: Cross-cutting utilities (API client, token/auth helpers).
- `assets/`: Static assets (images).
- `plugins/`: Expo config plugins (e.g. CodePush, Kakao Maven repo tweaks).
- `ios/`, `android/`: Native projects used by `expo run:*` (treat as generated unless you’re intentionally doing native work).

## Build, Test, and Development Commands

- `npm install`: Install dependencies (this repo uses `package-lock.json`).
- `npm run start`: Start Expo dev server.
- `npm run ios` / `npm run android`: Build/run the native dev client via Expo.
- `npm run web`: Run the web target.
- `npm run lint`: Run Expo’s ESLint checks.
- `npx tsc -p tsconfig.json --noEmit`: Type-check (TypeScript is `strict`).
- `node scripts/generate-token.js <API_KEY> <API_SECRET> [NAME]`: Generate a LiveKit access token for local testing.

## Coding Style & Naming Conventions

- Language: TypeScript + React Native (Expo). Use the `@/` path alias for imports.
- Formatting: follow existing patterns (2-space indent, single quotes). Keep components in `PascalCase`, hooks as `useSomething`, and files in `kebab-case` or `snake_case` only when already established.
- Linting: ESLint via `eslint.config.js` (`expo lint`). Prefer fixing lint/TS issues before opening a PR.

## Testing Guidelines

- There are no first-party automated tests configured yet. When adding logic-heavy code (auth, token handling, API utilities), include tests if you introduce a test framework.
- At minimum, run `npm run lint` and `npx tsc -p tsconfig.json --noEmit` before submitting.

## Commit & Pull Request Guidelines

- Commits follow a Conventional Commits-style prefix (e.g. `feat: …`, `fix: …`). Use clear, scoped messages when helpful: `feat(auth): …`.
- PRs should include: a short description, testing notes (iOS/Android/Web), and screenshots/screen recordings for UI changes. Link related issues if applicable.

## Security & Configuration Tips

- Do not commit secrets. Use `.env` for local config (it’s gitignored) and keep signing keys/certs out of git.
