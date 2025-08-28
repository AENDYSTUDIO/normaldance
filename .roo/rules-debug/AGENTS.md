# Project Debug Rules (Non-Obvious Only)

- **Custom server setup**: Debug via `server.ts` not Next.js, Socket.IO on `/api/socketio` path
- **Wallet debugging**: Use custom event emitter in `wallet-adapter.tsx`, not standard wallet-adapter-react patterns
- **Database**: Global Prisma instance in `src/lib/db.ts`, never create new instances
- **TypeScript**: Web3 code has relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Error handling**: Wallet operations return 0 on error, check for silent failures
- **Mobile app**: Extensive mocking in `mobile-app/jest.setup.js`, real modules not available in tests
- **Build process**: Use `tsx` directly, Next.js build disabled
- **File uploads**: Custom IPFS/Filecoin redundancy system in `src/lib/ipfs-enhanced.ts`
- **Testing**: Mobile tests require 30-second timeout due to extensive mocking
- **Socket.IO**: Custom setup in `server.ts`, not standard Next.js configuration