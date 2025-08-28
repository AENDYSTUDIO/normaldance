# Project Coding Rules (Non-Obvious Only)

- **Custom server setup**: Always use `server.ts` with Socket.IO instead of standard Next.js server
- **Wallet integration**: Use custom event emitter system in `src/components/wallet/wallet-adapter.tsx`, not standard wallet-adapter-react patterns
- **Deflationary model**: All token transactions must use `DeflationaryModel` class for automatic 2% burn calculation
- **Database**: Use global Prisma instance from `src/lib/db.ts`, never create new instances
- **TypeScript**: Web3 code intentionally has relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Error handling**: Wallet operations return 0 on error instead of throwing (silent failures)
- **Testing**: Mobile app tests require extensive mocking of React Native modules in `mobile-app/jest.setup.js`
- **Build process**: Use `tsx` directly for production builds, Next.js build is disabled
- **Socket.IO**: Custom setup in `server.ts` with path `/api/socketio`, not standard configuration
- **File uploads**: Use custom IPFS/Filecoin redundancy system in `src/lib/ipfs-enhanced.ts`