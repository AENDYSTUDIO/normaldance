# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Test Commands (Non-Obvious)

- **Single test execution**: `npm test -- --testPathPattern="filename.test.ts"` (Jest configured for specific file testing)
- **Mobile app tests**: `cd mobile-app && npm test` (Separate test environment with extensive mocking)
- **Development server**: `npm run dev` (Uses nodemon + tsx, not standard Next.js dev server)
- **Production build**: `npm run build` (Next.js build disabled, uses tsx directly)

## Critical Architecture Patterns

- **Custom server setup**: Uses `server.ts` with Socket.IO integration, not standard Next.js server
- **Wallet integration**: Phantom wallet only, custom event emitter system in `src/components/wallet/wallet-adapter.tsx`
- **Deflationary model**: 2% burn on all transactions, implemented in `src/lib/deflationary-model.ts`
- **Database**: Prisma with SQLite, global instance pattern in `src/lib/db.ts`
- **Middleware**: Role-based access control with NextAuth, artist/curator/admin paths protected

## Code Style (Project-Specific)

- **ESLint disabled**: All linting rules turned off in `eslint.config.mjs` (intentional)
- **TypeScript**: `noImplicitAny: false`, `no-non-null-assertion: off` (relaxed for Web3)
- **Import patterns**: Wallet utilities use custom event system, not standard React patterns
- **Error handling**: Silent failures in wallet operations, return 0 instead of throwing

## Testing Setup

- **Dual test environments**: Separate Jest configs for main app (`jest.config.js`) and mobile app (`mobile-app/jest.setup.js`)
- **Extensive mocking**: Mobile app mocks all React Native modules, expo libraries, and WebSocket
- **Test timeout**: 30 seconds for async operations (longer than standard)
- **Coverage**: Excludes `__tests__` directories from coverage reports

## Web3 Specific

- **Solana programs**: Custom Anchor programs in `programs/` with fixed program IDs
- **Transaction handling**: Custom transaction creation in `src/components/wallet/wallet-adapter.tsx`
- **Token formatting**: Russian locale formatting for SOL amounts, custom decimal handling
- **Wallet state**: Custom context system, not standard wallet-adapter-react patterns

## Mobile App

- **Expo setup**: Custom service layer in `mobile-app/src/services/mobileService.ts`
- **Audio handling**: Extensive mocking of expo-av for testing
- **Wallet integration**: Separate from main app, custom mobile wallet service