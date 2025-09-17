# Cursor AI Configuration for NORMALDANCE

## Project Context
This is a Web3 music platform built with Next.js, Solana blockchain integration, and React Native mobile app.

## Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Custom server with Socket.IO, Prisma ORM
- **Blockchain**: Solana Web3.js, custom wallet adapter
- **Mobile**: React Native with Expo
- **Database**: SQLite with Prisma
- **Storage**: IPFS/Filecoin with CDN fallback
- **State**: Zustand for global state management

## Architecture Highlights
- Custom server setup (not standard Next.js)
- Deflationary token model with 2% burn
- Custom Socket.IO path (/api/socketio)
- MCP (Model Context Protocol) server
- Multi-gateway IPFS redundancy
- Russian locale for SOL formatting

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Production build (uses tsx directly)
- `npm run mcp:dev` - Start MCP server with hot reload
- `npm test` - Run tests with Jest
- `cd mobile-app && npm start` - Start mobile app

## Critical Files
- `server.ts` - Custom server with Socket.IO
- `src/lib/db.ts` - Global Prisma instance
- `src/components/wallet/wallet-adapter.tsx` - Custom wallet system
- `src/lib/deflationary-model.ts` - Token economics
- `src/lib/ipfs-enhanced.ts` - File storage system

## Code Style
- ESLint disabled for faster builds
- Relaxed TypeScript types for Web3
- Silent failures in wallet operations
- Russian locale for token formatting
