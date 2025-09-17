# Ask Mode Rules (Non-Obvious Only)

- **Project architecture**: Custom server setup with Socket.IO integration instead of standard Next.js server
- **Wallet integration**: Custom event emitter system in `wallet-adapter.tsx`, not standard wallet-adapter-react patterns
- **Deflationary economics**: Complex 2% burn model with 20% staking rewards and 30% treasury distribution
- **Database pattern**: Global Prisma instance with connection timeout and error format configuration
- **IPFS system**: Multi-gateway redundancy with automatic chunking for files >10MB and manifest reconstruction
- **MCP server**: Custom protocol system (track://, user://, nft://, staking://) with specialized providers
- **Mobile architecture**: Separate React Native app with extensive mocking layer for testing
- **TypeScript configuration**: Web3 code uses relaxed type settings (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Build system**: Production builds use `tsx` directly, Next.js build is disabled
- **Testing setup**: Dual Jest environments with 30-second timeouts and comprehensive mocking
- **File storage**: IPFS/Filecoin redundancy with health monitoring across multiple gateways
- **Solana integration**: Fixed program IDs create tight coupling between frontend and smart contracts
- **Russian locale**: All financial calculations and display use Russian number formatting
- **Socket.IO server**: Custom server handles both Next.js and Socket.IO simultaneously on same port
- **ESLint configuration**: All rules intentionally disabled for build performance optimization
- **Error handling**: Silent failures in wallet operations return 0 instead of throwing exceptions
- **Transaction flow**: Custom Solana transaction creation not following standard patterns