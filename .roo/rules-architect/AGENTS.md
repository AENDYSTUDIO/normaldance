# Project Architecture Rules (Non-Obvious Only)

- **Custom server setup**: Uses `server.ts` with Socket.IO instead of standard Next.js server
- **Socket.IO path**: Custom `/api/socketio` path, not standard `/socket.io`
- **Wallet integration**: Custom event emitter system in `src/components/wallet/wallet-adapter.tsx`, not standard wallet-adapter-react patterns
- **Deflationary model**: 2% burn on all transactions, implemented in `src/lib/deflationary-model.ts`
- **Database**: Global Prisma instance in `src/lib/db.ts`, never create new instances
- **TypeScript**: Web3 code has relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Error handling**: Wallet operations return 0 on error instead of throwing (silent failures)
- **Testing**: Mobile app tests require extensive mocking of React Native modules in `mobile-app/jest.setup.js`
- **Build process**: Use `tsx` directly for production builds, Next.js build is disabled
- **File uploads**: Custom IPFS/Filecoin redundancy system in `src/lib/ipfs-enhanced.ts`
- **MCP server**: Separate Model Context Protocol server architecture
- **Solana programs**: Fixed program IDs create coupling between frontend and smart contracts
- **IPFS/Filecoin**: Redundancy system requires multiple gateway coordination
- **Mobile architecture**: Separate from main app with custom service layer
- **Deflationary economics**: 2% burn creates automatic token scarcity and treasury distribution
- **Russian locale formatting**: Built into all financial calculations and display
- **Fixed program IDs**: Hardcoded program IDs create tight frontend-smart contract coupling
- **IPFS chunking**: Large files automatically chunked with manifest-based reconstruction
- **Global wallet emitter**: Custom event system architecture for wallet state management
- **Deflationary distribution**: 2% burn with 20% staking rewards, 30% treasury allocation
- **Socket.IO server architecture**: Custom server handles both Next.js and Socket.IO simultaneously
- **ESLint architecture**: All rules disabled for build performance optimization
- **Jest architecture**: 30-second timeout for async operations due to extensive mocking
26 - **Mobile app architecture**: Complete module mocking layer for testing isolation