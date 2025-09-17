# Debug Mode Rules (Non-Obvious Only)

- **Wallet error handling**: Silent failures return 0 instead of throwing - check wallet operations first
- **Socket.IO debugging**: Use custom `/api/socketio` path, not standard `/socket.io` - check server.ts for connection issues
- **Database connection**: Global Prisma instance with 10-second timeout - check `src/lib/db.ts` for connection hangs
- **Deflationary model**: 2% burn calculations in `deflationary-model.ts` - verify burn amounts match expected percentages
- **IPFS chunking**: Files >10MB use manifest-based reconstruction - check chunked uploads in `ipfs-enhanced.ts`
- **MCP server**: Custom protocol URIs (track://, user://, nft://, staking://) - verify provider implementations
- **Mobile app mocking**: Extensive React Native mocking in `mobile-app/jest.setup.js` - check mock implementations for testing issues
- **Solana program IDs**: Fixed IDs in `wallet-adapter.tsx` - verify hardcoded constants match deployed programs
- **Transaction creation**: Custom transaction handling not using standard Solana patterns - verify transaction flow in `wallet-adapter.tsx`
- **Russian locale formatting**: SOL amounts use `formatSol()` with Russian locale - check number formatting in financial calculations
- **File chunking**: Large files automatically split into 10MB chunks with manifest - verify chunk creation and reconstruction
- **Global wallet emitter**: Custom event system in `wallet-adapter.tsx` - check event emission and handling
- **Deflationary distribution**: 2% burn with 20% staking rewards, 30% treasury - verify distribution calculations
- **Socket.IO server**: Custom server handles both Next.js and Socket.IO - check port conflicts and path routing
- **ESLint disabled**: All rules intentionally off for build speed - linting errors are expected
- **Jest timeout**: 30-second timeout for async operations - increase timeout for slow tests
- **IPFS gateways**: Multiple fallback gateways (ipfs.io, pinata.cloud, cloudflare-ipfs.com) - check gateway availability